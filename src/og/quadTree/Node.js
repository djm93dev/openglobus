/**
 * @module og/quadTree/Node
 */

'use strict';

import * as mercator from '../mercator.js';
import * as math from '../math.js';
import * as quadTree from './quadTree.js';
import { Extent } from '../Extent.js';
import { LonLat } from '../LonLat.js';
import { EPSG4326 } from '../proj/EPSG4326.js';
import { EPSG3857 } from '../proj/EPSG3857.js';
import { Vec3 } from '../math/Vec3.js';
import {
    NW, NE, SW, SE,
    N, E, S, W,
    COMSIDE, OPSIDE,
    WALKTHROUGH, NOTRENDERING,
    NEIGHBOUR, OPPART,
    VISIBLE_DISTANCE, RENDERING
} from './quadTree.js';

const POLE = mercator.POLE;
const MAX_LAT = mercator.MAX_LAT;

/**
 * Returns triangle coordinate array from inside of the source triangle array.
 * @static
 * @param {Array.<number>} sourceArr - Source array
 * @param {number} gridSize - Source array square matrix size
 * @param {number} i0 - First row index source array matrix
 * @param {number} j0 - First column index
 * @param {number} size - Square matrix result size.
 * @return{Array.<number>} Triangle coordinates array from the source array.
 * @TODO: optimization
 */
function getMatrixSubArray(sourceArr, gridSize, i0, j0, size) {
    const i0size = i0 + size + 1;
    const j0size = j0 + size + 1;
    var res = new Float32Array((size + 1) * (size + 1) * 3);
    var vInd = 0;
    for (var i = i0; i < i0size; i++) {
        for (var j = j0; j < j0size; j++) {
            var ind = 3 * (i * (gridSize + 1) + j);
            res[vInd++] = sourceArr[ind];
            res[vInd++] = sourceArr[ind + 1];
            res[vInd++] = sourceArr[ind + 2];
        }
    }
    return res;
}

/**
 * Quad tree planet segment node.
 * @constructor
 * @param {og.planetSegment.Segment|og.planetSegment.SegmentLonLat} segmentPrototype - Planet segment node constructor.
 * @param {og.scene.RenderNode} planet - Planet render node.
 * @param {number} partId - NorthEast, SouthWest etc.
 * @param {og.quadTree.Node} parent - Parent of this node.
 * @param {number} id - Tree node identifier (id * 4 + 1);
 * @param {number} tileZoom - Deep index of the quad tree.
 * @param {og.Extent} extent - Planet segment extent.
 */
const Node = function (segmentPrototype, planet, partId, parent, id, tileZoom, extent) {
    this.SegmentPrototype = segmentPrototype;
    this.planet = planet;
    this.parentNode = parent;
    this.partId = partId;
    this.nodeId = partId + id;
    this.state = null;
    this.appliedTerrainNodeId = -1;
    this.sideSize = [1, 1, 1, 1];
    this.ready = false;
    this.hasNeighbor = [false, false, false, false];
    this.neighbors = [[], [], [], []];
    this.nodes = [null, null, null, null];
    this.segment = new segmentPrototype(this, planet, tileZoom, extent);
    this._cameraInside = false;
    this.createBounds();
    this.planet._createdNodesCount++;
};

const _vertOrder = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
const _neGridSize = Math.sqrt(_vertOrder.length) - 1;

Node.prototype.createChildrenNodes = function () {

    this.ready = true;

    var p = this.planet;
    var ps = this.segment;
    var ext = ps._extent;
    var size_x = ext.getWidth() * 0.5;
    var size_y = ext.getHeight() * 0.5;
    var ne = ext.northEast, sw = ext.southWest;
    var z = ps.tileZoom + 1;
    var id = this.nodeId * 4 + 1;
    var c = new LonLat(sw.lon + size_x, sw.lat + size_y);
    var nd = this.nodes;

    nd[NW] = new Node(this.SegmentPrototype, p, NW, this, id, z,
        new Extent(new LonLat(sw.lon, sw.lat + size_y), new LonLat(sw.lon + size_x, ne.lat)));

    nd[NE] = new Node(this.SegmentPrototype, p, NE, this, id, z,
        new Extent(c, new LonLat(ne.lon, ne.lat)));

    nd[SW] = new Node(this.SegmentPrototype, p, SW, this, id, z,
        new Extent(new LonLat(sw.lon, sw.lat), c));

    nd[SE] = new Node(this.SegmentPrototype, p, SE, this, id, z,
        new Extent(new LonLat(sw.lon + size_x, sw.lat), new LonLat(ne.lon, sw.lat + size_y)));
};

Node.prototype.createBounds = function () {

    let seg = this.segment;

    seg._setExtentLonLat();

    if (!seg.tileZoom) {
        seg.bsphere.radius = seg.planet.ellipsoid._a;
        seg.bsphere.center = new Vec3();
    } else if (seg.tileZoom < seg.planet.terrain.minZoom) {
        seg.createBoundsByExtent();
    } else {
        let pn = this;

        while (pn.parentNode && !pn.segment.terrainReady) {
            pn = pn.parentNode;
        }

        let scale = this.segment.tileZoom - pn.segment.tileZoom,
            dZ2 = 1 << scale;

        let offsetX = this.segment.tileX - pn.segment.tileX * dZ2,
            offsetY = this.segment.tileY - pn.segment.tileY * dZ2;

        if (pn.segment.terrainReady) {
            let gridSize = pn.segment.gridSize / dZ2;
            if (gridSize >= 1) {
                let pVerts = pn.segment.terrainVertices;
                let i0 = gridSize * offsetY;
                let j0 = gridSize * offsetX;
                let ind1 = 3 * (i0 * (pn.segment.gridSize + 1) + j0);
                let ind2 = 3 * ((i0 + gridSize) * (pn.segment.gridSize + 1) + j0 + gridSize);
                seg.bsphere.setFromBounds([pVerts[ind1], pVerts[ind2], pVerts[ind1 + 1], pVerts[ind2 + 1], pVerts[ind1 + 2], pVerts[ind2 + 2]]);
            } else {
                let pseg = pn.segment;

                let i0 = Math.floor(gridSize * offsetY),
                    j0 = Math.floor(gridSize * offsetX);

                let insideSize = 1 / gridSize,
                    fullSize = insideSize * pseg.gridSize;

                let t_i0 = offsetY - insideSize * i0,
                    t_j0 = offsetX - insideSize * j0;

                let bigOne = getMatrixSubArray(pseg.terrainVertices, pseg.gridSize, i0, j0, 1);

                let v_lt = new Vec3(bigOne[0], bigOne[1], bigOne[2]),
                    v_rb = new Vec3(bigOne[9], bigOne[10], bigOne[11]);

                let vn = new Vec3(bigOne[3] - bigOne[0], bigOne[4] - bigOne[1], bigOne[5] - bigOne[2]),
                    vw = new Vec3(bigOne[6] - bigOne[0], bigOne[7] - bigOne[1], bigOne[8] - bigOne[2]),
                    ve = new Vec3(bigOne[3] - bigOne[9], bigOne[4] - bigOne[10], bigOne[5] - bigOne[11]),
                    vs = new Vec3(bigOne[6] - bigOne[9], bigOne[7] - bigOne[10], bigOne[8] - bigOne[11]);

                let vi_y = t_i0,
                    vi_x = t_j0;

                let coords_lt, coords_rb;

                if (vi_y + vi_x < insideSize) {
                    coords_lt = Vec3.add(vn.scaleTo(vi_x / insideSize), vw.scaleTo(vi_y / insideSize)).addA(v_lt);
                } else {
                    coords_lt = Vec3.add(vs.scaleTo(1 - vi_x / insideSize), ve.scaleTo(1 - vi_y / insideSize)).addA(v_rb);
                }

                vi_y = t_i0 + 1;
                vi_x = t_j0 + 1;

                if (vi_y + vi_x < insideSize) {
                    coords_rb = Vec3.add(vn.scaleTo(vi_x / insideSize), vw.scaleTo(vi_y / insideSize)).addA(v_lt);
                } else {
                    coords_rb = Vec3.add(vs.scaleTo(1 - vi_x / insideSize), ve.scaleTo(1 - vi_y / insideSize)).addA(v_rb);
                }

                seg.bsphere.radius = coords_lt.distance(coords_rb) * 0.5;
                seg.bsphere.center = coords_lt.addA(coords_rb.subA(coords_lt).scale(0.5));
            }
        } else {
            seg.createBoundsByExtent();
        }
    }
};

Node.prototype.getState = function () {
    //return this.segment.getNodeState();
    var pn = this.parentNode;
    while (pn) {
        if (pn.state !== WALKTHROUGH) {
            return NOTRENDERING;
        }
        pn = pn.parentNode;
    }
    return this.state;
};

/**
 * Returns the same deep existent neighbour node.
 * @public
 * @param {Number} side - Neighbour side index e.g. og.quadTree.N, og.quadTree.W etc.
 * @returns {og.quadTree.Node} -
 */
Node.prototype.getEqualNeighbor = function (side) {
    var pn = this;
    var part = NEIGHBOUR[side][pn.partId];
    if (part !== -1) {
        return pn.parentNode.nodes[part];
    } else {
        var pathId = [];
        while (pn.parentNode) {
            pathId.push(pn.partId);
            part = NEIGHBOUR[side][pn.partId];
            pn = pn.parentNode;
            if (part !== -1) {
                var i = pathId.length;
                side = OPSIDE[side];
                while (pn && i--) {
                    part = OPPART[side][pathId[i]];
                    pn = pn.nodes[part];
                }
                return pn;
            }
        }
    }
};

Node.prototype.isBrother = function (node) {
    return !(this.parentNode || node.parentNode) ||
        this.parentNode.id === node.parentNode.id;
};

Node.prototype.renderTree = function (maxZoom) {
    this.state = WALKTHROUGH;

    this.neighbors[0] = [];
    this.neighbors[1] = [];
    this.neighbors[2] = [];
    this.neighbors[3] = [];

    this.hasNeighbor[0] = false;
    this.hasNeighbor[1] = false;
    this.hasNeighbor[2] = false;
    this.hasNeighbor[3] = false;


    var cam = this.planet.renderer.activeCamera,
        seg = this.segment,
        planet = this.planet;


    if (this.parentNode) {

        this._cameraInside = false;

        //Search a node which the camera is flying over.
        if (this.parentNode._cameraInside) {
            var inside;
            if (Math.abs(cam._lonLat.lat) <= mercator.MAX_LAT &&
                seg._projection.id === EPSG3857.id) {
                inside = seg._extent.isInside(cam._lonLatMerc);
                cam._insideSegmentPosition = cam._lonLatMerc;
            } else if (seg._projection.id === EPSG4326.id) {
                inside = seg._extent.isInside(cam._lonLat);
                cam._insideSegmentPosition = cam._lonLat;
            }

            if (inside) {
                cam._insideSegment = seg;
                this._cameraInside = true;
            }
        }
    } else {
        this._cameraInside = true;
    }

    var inFrustum = cam.frustum.containsSphere(seg.bsphere);

    var h = cam._lonLat.height;

    var altVis = cam.eye.distance(seg.bsphere.center) - seg.bsphere.radius <
        VISIBLE_DISTANCE * Math.sqrt(h);

    if (inFrustum || this._cameraInside) {

        //First skip lowest zoom nodes
        if (seg.tileZoom < 2 && seg.normalMapReady) {

            this.traverseNodes(maxZoom);

        } else if (!maxZoom && seg.acceptForRendering(cam) || seg.tileZoom === maxZoom) {

            this.prepareForRendering(h, altVis);

        } else if (seg.tileZoom < planet.terrain._maxNodeZoom) {

            this.traverseNodes(maxZoom);

        } else {

            this.prepareForRendering(h, altVis);

        }

    } else {
        this.state = NOTRENDERING;
    }

    if (this.state !== NOTRENDERING && inFrustum && (altVis || h > 10000.0)) {
        seg._collectVisibleNodes();
    }
};

Node.prototype.traverseNodes = function (maxZoom) {
    if (!this.ready) {
        this.createChildrenNodes();
    }
    this.nodes[NW].renderTree(maxZoom);
    this.nodes[NE].renderTree(maxZoom);
    this.nodes[SW].renderTree(maxZoom);
    this.nodes[SE].renderTree(maxZoom);
};

Node.prototype.prepareForRendering = function (height, altVis, onlyTerrain) {
    if (height < 3000000.0) {
        if (altVis) {
            this.renderNode(onlyTerrain);
        } else {
            this.state = NOTRENDERING;
        }
    } else {
        this.renderNode(onlyTerrain);
    }
};

Node.prototype.renderNode = function (onlyTerrain) {

    var seg = this.segment;

    //Create and load terrain data.
    if (!seg.terrainReady) {

        if (!seg.initialized) {
            seg.initializePlainSegment();
        }

        this.whileTerrainLoading();

        if (!seg.ready && !seg.proceed) {
            seg.proceed = true;
            setTimeout(function () {
                seg.createPlainVertices();
                seg.proceed = false;
            }, 1000);
        }

        if (seg.ready) {
            seg.loadTerrain();
        }
    }

    if (onlyTerrain) {
        this.state = NOTRENDERING;
        return;
    }

    //Create normal map texture.
    if (seg.planet.lightEnabled && !seg.normalMapReady && !seg.parentNormalMapReady) {
        this.whileNormalMapCreating();
    }

    //Calculate minimal and maximal zoom index on the screen
    if (!this._cameraInside && seg.tileZoom > this.planet.maxCurrZoom) {
        this.planet.maxCurrZoom = seg.tileZoom;
    }

    if (seg.tileZoom < this.planet.minCurrZoom) {
        this.planet.minCurrZoom = seg.tileZoom;
    }

    seg._addViewExtent();

    //Finally this node proceeds to rendering.
    this.addToRender();
};

/**
 * Seraching for neighbours and pickup current node to render processing.
 * @public
 */
Node.prototype.addToRender = function () {

    this.state = RENDERING;

    var node = this;
    var nodes = node.planet._renderedNodes;

    for (var i = nodes.length - 1; i >= 0; --i) {
        var ni = nodes[i];

        var cs = node.getCommonSide(ni);

        if (cs !== -1) {

            var opcs = OPSIDE[cs];

            node.neighbors[cs].push(ni);
            ni.neighbors[opcs].push(node);

            if (!(node.hasNeighbor[cs] && ni.hasNeighbor[opcs])) {

                node.hasNeighbor[cs] = true;
                ni.hasNeighbor[opcs] = true;

                var ap = node.segment;
                var bp = ni.segment;
                var ld = ap.gridSize / (bp.gridSize * Math.pow(2, bp.tileZoom - ap.tileZoom));

                if (ld > 1) {
                    node.sideSize[cs] = Math.ceil(ap.gridSize / ld);
                    ni.sideSize[opcs] = bp.gridSize;
                }
                else if (ld < 1) {
                    node.sideSize[cs] = ap.gridSize;
                    ni.sideSize[opcs] = Math.ceil(bp.gridSize * ld);
                } else {
                    node.sideSize[cs] = ap.gridSize;
                    ni.sideSize[opcs] = bp.gridSize;
                }
            }
        }
    }

    nodes.push(node);
};

Node.prototype.getCommonSide = function (b) {

    var a = this,
        as = a.segment,
        bs = b.segment;

    if (as.tileZoom === bs.tileZoom) {
        return as.getNeighborSide(bs);
    } else if (as.tileZoom > bs.tileZoom) {
        let dz = as.tileZoom - bs.tileZoom,
            i = dz,
            p = this;

        while (i--) {
            p = p.parentNode;
        }

        let side = p.segment.getNeighborSide(bs);

        if (side !== -1) {
            i = dz;
            p = this;
            let _n = true;

            while (i--) {
                _n = _n && COMSIDE[p.partId][side];
            }

            if (_n) {
                return side;
            }
        }
    } else {
        let dz = bs.tileZoom - as.tileZoom,
            i = dz,
            p = b;

        while (i--) {
            p = p.parentNode;
        }

        let side = p.segment.getNeighborSide(as);

        if (side !== -1) {
            i = dz;
            p = b;
            let _n = true;

            while (i--) {
                _n = _n && COMSIDE[p.partId][side];
            }

            if (_n) {
                return OPSIDE[side];
            }
        }
    }

    return -1;
};

Node.prototype.whileNormalMapCreating = function () {

    var seg = this.segment;
    var maxZ = this.planet.terrain.maxZoom;

    if (seg.tileZoom <= maxZ && !seg.terrainIsLoading && seg.terrainReady && !seg._inTheQueue) {
        seg.planet._normalMapCreator.queue(seg);
    }

    var pn = this;

    while (pn.parentNode && !pn.segment.normalMapReady) {
        pn = pn.parentNode;
    }

    var dZ2 = 2 << (seg.tileZoom - pn.segment.tileZoom - 1);

    seg.normalMapTexture = pn.segment.normalMapTexture;
    seg.normalMapTextureBias[0] = seg.tileX - pn.segment.tileX * dZ2;
    seg.normalMapTextureBias[1] = seg.tileY - pn.segment.tileY * dZ2;
    seg.normalMapTextureBias[2] = 1 / dZ2;


    if (seg.tileZoom > maxZ) {
        if (pn.segment.tileZoom === maxZ) {
            seg.parentNormalMapReady = true;
        } else {
            pn = this;
            while (pn.parentNode && pn.segment.tileZoom !== maxZ) {
                pn = pn.parentNode;
            }
            var pns = pn.segment;
            if (!pns.ready) {
                pns.createPlainSegment();
                pns.loadTerrain();
            } else if (!pns._inTheQueue && !pns.terrainIsLoading) {
                pns.planet._normalMapCreator.queue(pns);
            }
        }
    }
};

function precision(a) {
    if (!isFinite(a)) return 0;
    var e = 1, p = 0;
    while (Math.round(a * e) / e !== a) { e *= 10; p++; }
    return p;
}

Node.prototype.whileTerrainLoading = function () {

    const seg = this.segment;
    const terrain = this.planet.terrain;

    let pn = this;

    while (pn.parentNode && !pn.segment.terrainReady) {
        pn = pn.parentNode;
    }

    if (pn.segment.terrainReady) {

        let dZ2 = 2 << (seg.tileZoom - pn.segment.tileZoom - 1);
        let offsetX = seg.tileX - pn.segment.tileX * dZ2,
            offsetY = seg.tileY - pn.segment.tileY * dZ2;

        let pseg = pn.segment;

        let tempVertices,
            tempNormalMapNormals;

        if (this.appliedTerrainNodeId !== pn.nodeId) {

            let gridSize = pn.segment.gridSize / dZ2;

            let fgs = terrain.fileGridSize,
                fgsZ = fgs / dZ2;

            if (gridSize >= 1) {
                seg.gridSize = gridSize;
                this.sideSize = [gridSize, gridSize, gridSize, gridSize];

                tempVertices = getMatrixSubArray(pseg.terrainVertices,
                    pseg.gridSize, gridSize * offsetY, gridSize * offsetX, gridSize);

                tempNormalMapNormals = getMatrixSubArray(pseg.normalMapNormals,
                    fgs, fgsZ * offsetY, fgsZ * offsetX, fgsZ);
            } else {
                seg.gridSize = _neGridSize;
                this.sideSize = [_neGridSize, _neGridSize, _neGridSize, _neGridSize];

                let i0 = Math.floor(gridSize * offsetY),
                    j0 = Math.floor(gridSize * offsetX);

                let bigOne = getMatrixSubArray(pseg.terrainVertices, pseg.gridSize, i0, j0, 1);

                let insideSize = 1.0 / gridSize;

                let t_i0 = offsetY - insideSize * i0,
                    t_j0 = offsetX - insideSize * j0;

                let v_lt = new Vec3(bigOne[0], bigOne[1], bigOne[2]),
                    v_rb = new Vec3(bigOne[9], bigOne[10], bigOne[11]);

                let vn = new Vec3(bigOne[3] - bigOne[0], bigOne[4] - bigOne[1], bigOne[5] - bigOne[2]),
                    vw = new Vec3(bigOne[6] - bigOne[0], bigOne[7] - bigOne[1], bigOne[8] - bigOne[2]),
                    ve = new Vec3(bigOne[3] - bigOne[9], bigOne[4] - bigOne[10], bigOne[5] - bigOne[11]),
                    vs = new Vec3(bigOne[6] - bigOne[9], bigOne[7] - bigOne[10], bigOne[8] - bigOne[11]);

                let coords = new Vec3();

                tempVertices = new Float32Array(3 * _vertOrder.length);
                //tempNormalMapNormals = new Float32Array(3 * _vertOrder.length);

                for (var i = 0; i < _vertOrder.length; i++) {
                    let vi_y = _vertOrder[i].y + t_i0,
                        vi_x = _vertOrder[i].x + t_j0;

                    let vi_x_is = vi_x * gridSize,
                        vi_y_is = vi_y * gridSize;

                    if (vi_y + vi_x < insideSize) {
                        coords = vn.scaleTo(vi_x_is).addA(vw.scaleTo(vi_y_is)).addA(v_lt);
                    } else {
                        coords = vs.scaleTo(1 - vi_x_is).addA(ve.scaleTo(1 - vi_y_is)).addA(v_rb);
                    }

                    let i3 = i * 3;

                    tempVertices[i3] = coords.x;
                    tempVertices[i3 + 1] = coords.y;
                    tempVertices[i3 + 2] = coords.z;
                }
            }

            seg.createCoordsBuffers(tempVertices, seg.gridSize);
            seg.readyToEngage = false;

            //seg.tempVertices is used for earth point calculation(see segment object)
            seg.tempVertices = tempVertices;

            this.appliedTerrainNodeId = pn.nodeId;
        }

        let maxZ = terrain.maxZoom;

        if (seg.tileZoom > maxZ) {
            if (pn.segment.tileZoom >= maxZ) {
                seg.terrainReady = true;
                seg.terrainIsLoading = false;
                this.appliedTerrainNodeId = this.nodeId;
                if (pn.segment.terrainExists) {
                    seg.readyToEngage = true;
                    seg.terrainExists = true;
                    seg.terrainVertices = tempVertices;
                    seg.normalMapNormals = tempNormalMapNormals;
                }
            } else {
                pn = this;
                while (pn.parentNode && pn.segment.tileZoom !== maxZ) {
                    pn = pn.parentNode;
                }
                let pns = pn.segment;
                // if (!pns.ready) {
                //     pns.createPlainSegment();
                // }
                //pns.loadTerrain();
            }
        }
    }
};

Node.prototype.destroy = function () {
    this.state = NOTRENDERING;
    this.segment.destroySegment();
    var n = this.neighbors;
    n[N] && n[N].neighbors && (n[N].neighbors[S] = []);
    n[E] && n[E].neighbors && (n[E].neighbors[W] = []);
    n[S] && n[S].neighbors && (n[S].neighbors[N] = []);
    n[W] && n[W].neighbors && (n[W].neighbors[E] = []);
    this.neighbors = null;
    this.hasNeighbors = null;
    this.parentNode = null;
    this.sideSize = null;
    this.segment = null;
};

Node.prototype.clearTree = function () {

    var state = this.getState();

    if (state === NOTRENDERING) {
        this.destroyBranches();
    } else if (state === RENDERING) {
        this.destroyBranches();
    } else {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i] && this.nodes[i].clearTree();
        }
    }
};

Node.prototype.clearBranches = function () {
    for (i = 0; i < this.nodes.length; i++) {
        this.nodes[i].clearBranches();
        this.nodes[i].segment.deleteMaterials();
    }
};

Node.prototype.destroyBranches = function () {

    if (this.ready) {

        var nodesToRemove = [], i;

        for (i = 0; i < this.nodes.length; i++) {
            nodesToRemove[i] = this.nodes[i];
        }

        this.ready = false;
        this.nodes.length = 0;

        for (i = 0; i < nodesToRemove.length; i++) {
            nodesToRemove[i].destroyBranches();
            nodesToRemove[i].destroy();
            nodesToRemove[i] = null;
        }

        nodesToRemove.length = 0;
        nodesToRemove = null;
    }
};

Node.prototype.traverseTree = function (callback) {
    callback(this);
    if (this.ready) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].traverseTree(callback);
        }
    }
};

export { Node };


