"use strict";

/**
 * @module og/entity/ShapeHandler
 */
import * as shaders from "../shaders/geoObject.js";
import { concatTypedArrays, spliceTypedArray } from "../utils/shared.js";

const VERTEX_BUFFER = 0;
const POSITION_BUFFER = 1;
const RGBA_BUFFER = 2;
const NORMALS_BUFFER = 3;
const INDECIES_BUFFER = 4;
const DIRECTION_BUFFER = 5;
const PITCH_ROLL_BUFFER = 6;
const SIZE_BUFFER = 7;
const PICKINGCOLOR_BUFFER = 8;

class GeoObjectHandler {
    constructor(entityCollection) {
        /**
         * Picking rendering option.
         * @public
         * @type {boolean}
         */
        this.pickingEnabled = true;

        this._entityCollection = entityCollection;
        this._renderer = null;
        this._planet = null;

        this._geoObjects = [];
        this._pitchRollArr = new Float32Array();
        this._sizeArr = new Float32Array();
        this._vertexArr = new Float32Array();
        this._positionHighArr = new Float32Array();
        this._positionLowArr = new Float32Array();
        this._directionArr = new Float32Array();
        this._rgbaArr = new Float32Array();
        this._normalsArr = new Float32Array();
        this._indicesArr = new Uint16Array();
        this._pickingColorArr = new Float32Array();

        this.__staticId = GeoObjectHandler._staticCounter++;

        this._buffersUpdateCallbacks = [];
        this._buffersUpdateCallbacks[PICKINGCOLOR_BUFFER] = this.createPickingColorBuffer;
        this._buffersUpdateCallbacks[POSITION_BUFFER] = this.createPositionBuffer;
        this._buffersUpdateCallbacks[DIRECTION_BUFFER] = this.createDirectionBuffer;
        this._buffersUpdateCallbacks[NORMALS_BUFFER] = this.createNormalsBuffer;
        this._buffersUpdateCallbacks[RGBA_BUFFER] = this.createRgbaBuffer;
        this._buffersUpdateCallbacks[INDECIES_BUFFER] = this.createIndicesBuffer;
        this._buffersUpdateCallbacks[VERTEX_BUFFER] = this.createVertexBuffer;
        this._buffersUpdateCallbacks[SIZE_BUFFER] = this.createSizeBuffer;
        this._buffersUpdateCallbacks[PITCH_ROLL_BUFFER] = this.createPitchRollBuffer;

        this._changedBuffers = new Array(this._buffersUpdateCallbacks.length);
    }

    //Create buffers
    createVertexBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._vertexBuffer);
        this._vertexBuffer = h.createArrayBuffer(this._vertexArr, 3, this._vertexArr.length / 3);
    }

    createPitchRollBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._pitchRollBuffer);
        this._pitchRollBuffer = h.createArrayBuffer(
            this._pitchRollArr,
            2,
            this._pitchRollArr.length / 2
        );
    }

    createSizeBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._sizeBuffer);
        this._sizeBuffer = h.createArrayBuffer(this._sizeArr, 3, this._sizeArr.length / 3);
    }

    createPositionBuffer() {
        let h = this._renderer.handler,
            numItems = this._positionHighArr.length / 3;

        if (!this._positionHighBuffer || this._positionHighBuffer.numItems !== numItems) {
            h.gl.deleteBuffer(this._positionHighBuffer);
            h.gl.deleteBuffer(this._positionLowBuffer);
            this._positionHighBuffer = h.createStreamArrayBuffer(3, numItems);
            this._positionLowBuffer = h.createStreamArrayBuffer(3, numItems);
        }

        h.setStreamArrayBuffer(this._positionHighBuffer, this._positionHighArr);
        h.setStreamArrayBuffer(this._positionLowBuffer, this._positionLowArr);
    }

    createRgbaBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._rgbaBuffer);
        this._rgbaBuffer = h.createArrayBuffer(this._rgbaArr, 4, this._rgbaArr.length / 4);
    }

    createDirectionBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._directionBuffer);
        this._directionBuffer = h.createArrayBuffer(
            this._directionArr,
            3,
            this._directionArr.length / 3
        );
    }

    createNormalsBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._normalsBuffer);
        this._normalsBuffer = h.createArrayBuffer(this._normalsArr, 3, this._normalsArr.length / 3);
    }

    createIndicesBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._indicesBuffer);
        this._indicesBuffer = h.createElementArrayBuffer(
            new Uint16Array(this._indicesArr),
            1,
            this._indicesArr.length
        );
    }

    createPickingColorBuffer() {
        var h = this._renderer.handler;
        h.gl.deleteBuffer(this._pickingColorBuffer);
        this._pickingColorBuffer = h.createArrayBuffer(
            this._pickingColorArr,
            3,
            this._pickingColorArr.length / 3
        );
    }

    static get _staticCounter() {
        if (!this._counter && this._counter !== 0) {
            this._counter = 0;
        }
        return this._counter;
    }

    static set _staticCounter(n) {
        this._counter = n;
    }

    initProgram() {
        if (this._renderer.handler) {
            if (!this._renderer.handler.programs.geo_object) {
                this._renderer.handler.addProgram(shaders.geo_object());
            }
        }
    }

    setRenderNode(renderNode) {
        this._renderer = renderNode.renderer;
        this._planet = renderNode;
        this.initProgram();
    }

    setRenderer(planet) {
        super.setRenderer(planet);
    }

    _addGeoObjectToArrays(geoObject) {
        if (geoObject._visibility) {
            this._vertexArr = concatTypedArrays(
                this._vertexArr,
                [-1.0, 0.0, 0.5, 0.0, 0.0, -0.5, 1.0, 0.0, 0.5]
            );
        } else {
            this._vertexArr = concatTypedArrays(this._vertexArr, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }

        var x = geoObject._positionHigh.x,
            y = geoObject._positionHigh.y,
            z = geoObject._positionHigh.z,
            w;
        this._positionHighArr = concatTypedArrays(this._positionHighArr, [
            x,
            y,
            z,
            x,
            y,
            z,
            x,
            y,
            z
        ]);

        x = geoObject._positionLow.x;
        y = geoObject._positionLow.y;
        z = geoObject._positionLow.z;
        this._positionLowArr = concatTypedArrays(this._positionLowArr, [x, y, z, x, y, z, x, y, z]);

        x = geoObject._color.x;
        y = geoObject._color.y;
        z = geoObject._color.z;
        w = geoObject._color.w;
        this._rgbaArr = concatTypedArrays(this._rgbaArr, [x, y, z, w, x, y, z, w, x, y, z, w]);

        x = geoObject._entity._pickingColor.x / 255;
        y = geoObject._entity._pickingColor.y / 255;
        z = geoObject._entity._pickingColor.z / 255;
        this._pickingColorArr = concatTypedArrays(this._pickingColorArr, [
            x,
            y,
            z,
            x,
            y,
            z,
            x,
            y,
            z
        ]);

        x = geoObject._direction.x;
        y = geoObject._direction.y;
        z = geoObject._direction.z;
        this._directionArr = concatTypedArrays(this._directionArr, [x, y, z, x, y, z, x, y, z]);
        this._normalsArr = concatTypedArrays(
            this._normalsArr,
            [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
        );
        this._indicesArr = concatTypedArrays(this._indicesArr, [0, 1, 2, 0, 2, 1]);

        x = geoObject._pitch;
        y = geoObject._roll;
        this._pitchRollArr = concatTypedArrays(this._pitchRollArr, [x, y, x, y, x, y]);

        for (const buffer in this._changedBuffers) {
            this._changedBuffers[buffer] = true;
        }
    }

    _displayPASS() {
        var r = this._renderer;
        var sh = r.handler.programs.geo_object;
        var p = sh._program,
            u = p.uniforms,
            a = p.attributes;
        var gl = r.handler.gl,
            ec = this._entityCollection;

        sh.activate();

        gl.uniform3fv(u.uScaleByDistance, ec.scaleByDistance);

        gl.uniform3fv(u.eyePositionHigh, r.activeCamera.eyeHigh);
        gl.uniform3fv(u.eyePositionLow, r.activeCamera.eyeLow);

        gl.uniformMatrix4fv(u.projectionMatrix, false, r.activeCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(u.viewMatrix, false, r.activeCamera.getViewMatrix());
        gl.uniformMatrix3fv(u.normalMatrix, false, r.activeCamera._normalMatrix._m);

        gl.uniform4fv(u.lightsPositions, this._planet._lightsTransformedPositions);
        gl.uniform3fv(u.lightsParamsv, this._planet._lightsParamsv);
        gl.uniform1fv(u.lightsParamsf, this._planet._lightsParamsf);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._normalsBuffer);
        gl.vertexAttribPointer(
            a.aVertexNormal,
            this._normalsBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(
            a.aVertexPosition,
            this._vertexBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this._directionBuffer);
        gl.vertexAttribPointer(a.aDirection, this._directionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionHighBuffer);
        gl.vertexAttribPointer(
            a.aPositionHigh,
            this._positionHighBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionLowBuffer);
        gl.vertexAttribPointer(
            a.aPositionLow,
            this._positionLowBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, this._pitchRollBuffer);
        gl.vertexAttribPointer(a.aPitchRoll, this._pitchRollBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._rgbaBuffer);
        gl.vertexAttribPointer(a.aColor, this._rgbaBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
        gl.drawElements(gl.TRIANGLES, this._indicesBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    setVertexArr(index, vertexArr) {
        var i = index * 9;
        var a = this._vertexArr;

        a[i] = vertexArr[0];
        a[i + 1] = vertexArr[1];
        a[i + 2] = vertexArr[2];

        a[i + 3] = vertexArr[3];
        a[i + 4] = vertexArr[4];
        a[i + 5] = vertexArr[5];

        a[i + 6] = vertexArr[6];
        a[i + 7] = vertexArr[7];
        a[i + 8] = vertexArr[8];

        this._changedBuffers[VERTEX_BUFFER] = true;
    }

    setDirectionArr(index, direction) {
        var i = index * 9;
        var a = this._directionArr,
            x = direction.x,
            y = direction.y,
            z = direction.z;

        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = z;

        a[i + 3] = x;
        a[i + 4] = y;
        a[i + 5] = z;

        a[i + 6] = x;
        a[i + 7] = y;
        a[i + 8] = z;

        this._changedBuffers[DIRECTION_BUFFER] = true;
    }

    setVisibility(index, visibility) {
        var vArr;
        if (visibility) {
            vArr = [-1.0, 0.0, 0.5, 0.0, 0.0, -0.5, 1.0, 0.0, 0.5];
        } else {
            vArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        this.setVertexArr(index, vArr);
        this.setNormalsArr(index);
        this.setIndicesArr(index);
    }

    setPositionArr(index, positionHigh, positionLow) {
        var i = index * 9;

        // High
        var a = this._positionHighArr,
            x = positionHigh.x,
            y = positionHigh.y,
            z = positionHigh.z;

        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = z;

        a[i + 3] = x;
        a[i + 4] = y;
        a[i + 5] = z;

        a[i + 6] = x;
        a[i + 7] = y;
        a[i + 8] = z;

        // Low
        a = this._positionLowArr;
        x = positionLow.x;
        y = positionLow.y;
        z = positionLow.z;

        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = z;

        a[i + 3] = x;
        a[i + 4] = y;
        a[i + 5] = z;

        a[i + 6] = x;
        a[i + 7] = y;
        a[i + 8] = z;

        this._changedBuffers[POSITION_BUFFER] = true;
    }

    setRgbaArr(index, rgba) {
        var i = index * 12;
        var a = this._rgbaArr,
            x = rgba.x,
            y = rgba.y,
            z = rgba.z,
            w = rgba.w;

        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = z;
        a[i + 3] = w;

        a[i + 4] = x;
        a[i + 5] = y;
        a[i + 6] = z;
        a[i + 7] = w;

        a[i + 8] = x;
        a[i + 9] = y;
        a[i + 10] = z;
        a[i + 11] = w;

        this._changedBuffers[RGBA_BUFFER] = true;
    }

    setNormalsArr(index) {
        var i = index * 9;
        var a = this._normalsArr,
            x = 0.0,
            y = 1.0,
            z = 0.0;
        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = z;

        a[i + 3] = x;
        a[i + 4] = y;
        a[i + 5] = z;

        a[i + 6] = x;
        a[i + 7] = y;
        a[i + 8] = z;
        this._changedBuffers[NORMALS_BUFFER] = true;
    }

    setPickingColorArr(index, color) {
        var i = index * 9;
        var a = this._pickingColorArr,
            x = color.x / 255,
            y = color.y / 255,
            z = color.z / 255;

        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = z;

        a[i + 3] = x;
        a[i + 4] = y;
        a[i + 5] = z;

        a[i + 6] = x;
        a[i + 7] = y;
        a[i + 8] = z;

        this._changedBuffers[PICKINGCOLOR_BUFFER] = true;
    }

    setIndicesArr(index) {
        var i = index * 6;
        var a = this._indicesArr;
        a[i] = 0;
        a[i + 1] = 1;
        a[i + 2] = 2;

        a[i + 3] = 0;
        a[i + 4] = 2;
        a[i + 5] = 1;
        this._changedBuffers[INDECIES_BUFFER] = true;
    }

    setPitchRollArr(index, pitch, roll) {
        var i = index * 6;
        var a = this._pitchRollArr;

        a[i] = pitch;
        a[i + 1] = roll;
        a[i + 2] = pitch;

        a[i + 3] = roll;
        a[i + 4] = pitch;
        a[i + 5] = roll;
        this._changedBuffers[PITCH_ROLL_BUFFER] = true;
    }

    setSizeArr(index, scale) {
        var i = index * 6;
        var a = this._pitchRollArr;
        a[i] = scale;
        a[i + 1] = scale;
        a[i + 2] = scale;

        this._changedBuffers[SIZE_BUFFER] = true;
    }

    refresh() {
        var i = this._changedBuffers.length;
        while (i--) {
            this._changedBuffers[i] = true;
        }
    }

    _removeGeoObjects() {
        var i = this._geoObjects.length;
        while (i--) {
            var bi = this._geoObjects[i];
            bi._handlerIndex = -1;
            bi._handler = null;
        }
        this._geoObjects.length = 0;
        this._geoObjects = [];
    }

    clear() {
        this._sizeArr = null;
        this._pitchRollArr = null;
        this._vertexArr = null;
        this._positionHighArr = null;
        this._positionLowArr = null;
        this._directionArr = null;
        this._rgbaArr = null;
        this._normalsArr = null;
        this._indicesArr = null;
        this._pickingColorArr = null;

        this._pitchRollArr = new Float32Array();
        this._sizeArr = new Float32Array();
        this._vertexArr = new Float32Array();
        this._positionHighArr = new Float32Array();
        this._positionLowArr = new Float32Array();
        this._rgbaArr = new Float32Array();
        this._directionArr = new Float32Array();
        this._normalsArr = new Float32Array();
        this._indicesArr = new Uint16Array();
        this._pickingColorArr = new Float32Array();

        this._removeGeoObjects();
        this._deleteBuffers();
        this.refresh();
    }

    _deleteBuffers() {
        if (this._renderer) {
            var gl = this._renderer.handler.gl;
            gl.deleteBuffer(this._sizeBuffer);
            gl.deleteBuffer(this._pitchRollBuffer);
            gl.deleteBuffer(this._vertexBuffer);
            gl.deleteBuffer(this._positionHighBuffer);
            gl.deleteBuffer(this._positionLowBuffer);
            gl.deleteBuffer(this._rgbaBuffer);
            gl.deleteBuffer(this._indicesBuffer);
            gl.deleteBuffer(this._normalsBuffer);
            gl.deleteBuffer(this._directionBuffer);
            gl.deleteBuffer(this._pickingColorBuffer);
        }

        this._pitchRollBuffer = null;
        this._sizeBuffer = null;
        this._vertexBuffer = null;
        this._positionHighBuffer = null;
        this._positionLowBuffer = null;
        this._rgbaBuffer = null;
        this._indicesBuffer = null;
        this._normalsBuffer = null;
        this._directionBuffer = null;
        this._pickingColorBuffer = null;
    }

    update() {
        if (this._renderer) {
            var i = this._changedBuffers.length;
            while (i--) {
                if (this._changedBuffers[i]) {
                    this._buffersUpdateCallbacks[i].call(this);
                    this._changedBuffers[i] = false;
                }
            }
        }
    }

    draw() {
        if (this._geoObjects.length) {
            this.update();
            this._displayPASS();
        }
    }

    reindexGeoObjects(startIndex) {
        var b = this._geoObjects;
        for (var i = startIndex; i < b.length; i++) {
            b[i]._handlerIndex = i;
        }
    }

    add(geoObject) {
        if (geoObject._handlerIndex === -1) {
            geoObject._handler = this;
            geoObject._handlerIndex = this._geoObjects.length;
            this._geoObjects.push(geoObject);
            this._addGeoObjectToArrays(geoObject);
            this.refresh();
        }
    }

    remove(geoObject) {
        if (geoObject._handler && this.__staticId == geoObject._handler.__staticId) {
            this._removeGeoObject(geoObject);
        }
    }

    _removeGeoObject(geoObject) {
        var gi = geoObject._handlerIndex;

        this._geoObjects.splice(gi, 1);

        var i = gi * 12;
        this._rgbaArr = spliceTypedArray(this._rgbaArr, i, 12);

        i = gi * 9;
        this._vertexArr = spliceTypedArray(this._vertexArr, i, 9);
        this._positionHighArr = spliceTypedArray(this._positionHighArr, i, 9);
        this._positionLowArr = spliceTypedArray(this._positionLowArr, i, 9);
        this._directionArr = spliceTypedArray(this._directionArr, i, 9);
        this._normalsArr = spliceTypedArray(this._normalsArr, i, 9);
        this._pickingColorArr = spliceTypedArray(this._pickingColorArr, i, 9);

        i = gi * 6;
        this._pitchRollArr = spliceTypedArray(this._pitchRollArr, i, 6);
        this._indicesArr = spliceTypedArray(this._indicesArr, i, 6);
        i = gi * 3;
        this._sizeArr = spliceTypedArray(this._sizeArr, i, 3);

        this.reindexGeoObjects(gi);
        this.refresh();

        geoObject._handlerIndex = -1;
        geoObject._handler = null;
    }
}

export { GeoObjectHandler };
