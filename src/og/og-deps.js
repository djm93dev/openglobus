// This file was autogenerated by D:\my projects\closure-library\closure\bin\build\depswriter.py.
// Please do not edit.
goog.addDependency('../../../og/src/og/ajax.js', ['og.Ajax'], []);
goog.addDependency('../../../og/src/og/bv/box.js', ['og.bv.Box'], ['og.bv', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/bv/bv.js', ['og.bv'], ['og.Extent', 'og.LonLat', 'og.math']);
goog.addDependency('../../../og/src/og/bv/sphere.js', ['og.bv.Sphere'], ['og.bv', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/camera/camera.js', ['og.Camera'], ['og.Events', 'og.Frustum', 'og.math', 'og.math.Matrix4', 'og.math.Pixel', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/camera/planetCamera.js', ['og.PlanetCamera'], ['og.Camera', 'og.inheritance']);
goog.addDependency('../../../og/src/og/control/control.js', ['og.control.Control'], []);
goog.addDependency('../../../og/src/og/control/keyboardNavigation.js', ['og.control.KeyboardNavigation'], ['og.control.Control', 'og.inheritance', 'og.input']);
goog.addDependency('../../../og/src/og/control/layerSwitcher.js', ['og.control.LayerSwitcher'], ['og.inheritance']);
goog.addDependency('../../../og/src/og/control/loadingSpinner.js', ['og.control.LoadingSpinner'], ['og.control.Control', 'og.inheritance']);
goog.addDependency('../../../og/src/og/control/mouseNavigation.js', ['og.control.MouseNavigation'], ['og.bv.Sphere', 'og.control.Control', 'og.inheritance', 'og.math', 'og.math.Matrix4', 'og.math.Quaternion', 'og.math.Ray', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/control/mousePosition.js', ['og.control.MousePosition'], ['og.control.Control', 'og.inheritance', 'og.mercator', 'og.planetSegment']);
goog.addDependency('../../../og/src/og/control/showFps.js', ['og.control.ShowFps'], ['og.control.Control', 'og.inheritance']);
goog.addDependency('../../../og/src/og/control/simpleNavigation.js', ['og.control.SimpleNavigation'], ['og.control.Control', 'og.inheritance', 'og.input']);
goog.addDependency('../../../og/src/og/control/toggleWireframe.js', ['og.control.ToggleWireframe'], ['og.inheritance', 'og.input', 'og.webgl']);
goog.addDependency('../../../og/src/og/ellipsoid/ellipsoid.js', ['og.Ellipsoid'], ['og.LonLat', 'og.math', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/ellipsoid/wgs84ellipsoid.js', ['og.ellipsoid.wgs84'], ['og.Ellipsoid']);
goog.addDependency('../../../og/src/og/events/events.js', ['og.Events'], []);
goog.addDependency('../../../og/src/og/extent/extent.js', ['og.Extent'], ['og.LonLat']);
goog.addDependency('../../../og/src/og/frustum.js', ['og.Frustum'], []);
goog.addDependency('../../../og/src/og/globus.js', ['og.Globus'], ['og.Renderer', 'og.ellipsoid.wgs84', 'og.node.Planet', 'og.webgl.Handler']);
goog.addDependency('../../../og/src/og/imageCanvas/imageCanvas.js', ['og.ImageCanvas'], []);
goog.addDependency('../../../og/src/og/inheritance.js', ['og.inheritance'], []);
goog.addDependency('../../../og/src/og/input/input.js', ['og.input'], []);
goog.addDependency('../../../og/src/og/input/keyboardHandler.js', ['og.input.KeyboardHandler'], []);
goog.addDependency('../../../og/src/og/input/mouseHandler.js', ['og.input.MouseHandler'], []);
goog.addDependency('../../../og/src/og/layer/layer.js', ['og.layer', 'og.layer.Layer'], ['og.Events']);
goog.addDependency('../../../og/src/og/layer/wms.js', ['og.layer.WMS'], ['og.inheritance', 'og.layer.XYZ']);
goog.addDependency('../../../og/src/og/layer/xyz.js', ['og.layer.XYZ'], ['og.inheritance', 'og.layer.Layer', 'og.quadTree']);
goog.addDependency('../../../og/src/og/lonlat.js', ['og.LonLat'], ['og.mercator']);
goog.addDependency('../../../og/src/og/math/coder.js', ['og.math.coder'], ['og.math', 'og.math.Vector4']);
goog.addDependency('../../../og/src/og/math/math.js', ['og.math'], []);
goog.addDependency('../../../og/src/og/math/matrix4.js', ['og.math.Matrix4'], ['og.math', 'og.math.Vector3', 'og.math.Vector4']);
goog.addDependency('../../../og/src/og/math/pixel.js', ['og.math.Pixel'], []);
goog.addDependency('../../../og/src/og/math/quaternion.js', ['og.math.Quaternion'], ['og.math', 'og.math.Matrix4']);
goog.addDependency('../../../og/src/og/math/ray.js', ['og.math.Ray'], ['og.math.Vector3']);
goog.addDependency('../../../og/src/og/math/vector2.js', ['og.math.Vector2'], ['og.math.Vector3']);
goog.addDependency('../../../og/src/og/math/vector3.js', ['og.math.Vector3'], []);
goog.addDependency('../../../og/src/og/math/vector4.js', ['og.math.Vector4'], ['og.math', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/mercator.js', ['og.mercator'], []);
goog.addDependency('../../../og/src/og/node/axes.js', ['og.node.Axes'], ['og.inheritance', 'og.node.RenderNode']);
goog.addDependency('../../../og/src/og/node/node.js', ['og.node.Node'], []);
goog.addDependency('../../../og/src/og/node/planet.js', ['og.node.Planet'], ['og.Events', 'og.Extent', 'og.PlanetCamera', 'og.bv.Sphere', 'og.inheritance', 'og.layer', 'og.math.Matrix4', 'og.math.Ray', 'og.math.Vector3', 'og.math.coder', 'og.mercator', 'og.node.RenderNode', 'og.planetSegment', 'og.planetSegment.PlanetSegmentHelper', 'og.planetSegment.Wgs84PlanetSegment', 'og.proj.EPSG4326', 'og.quadTree', 'og.quadTree.QuadNode', 'og.shaderProgram.overlays', 'og.shaderProgram.picking', 'og.shaderProgram.single', 'og.webgl.Framebuffer']);
goog.addDependency('../../../og/src/og/node/renderNode.js', ['og.node.RenderNode'], ['og.inheritance', 'og.math.Matrix4', 'og.math.Vector3', 'og.node.Node', 'og.webgl']);
goog.addDependency('../../../og/src/og/node/skyBox.js', ['og.node.SkyBox'], ['og.inheritance', 'og.node.RenderNode', 'og.shaderProgram.skybox']);
goog.addDependency('../../../og/src/og/og.js', ['og'], []);
goog.addDependency('../../../og/src/og/planetSegment/planetSegment.js', ['og.planetSegment', 'og.planetSegment.PlanetSegment'], ['og.Extent', 'og.LonLat', 'og.bv.Box', 'og.bv.Sphere', 'og.layer', 'og.math', 'og.math.Vector3', 'og.mercator', 'og.planetSegment.PlanetSegmentHelper', 'og.proj.EPSG3857']);
goog.addDependency('../../../og/src/og/planetSegment/planetSegmentHelper.js', ['og.planetSegment.PlanetSegmentHelper'], ['og.quadTree']);
goog.addDependency('../../../og/src/og/planetSegment/planetSegmentMaterial.js', ['og.planetSegment.PlanetSegmentMaterial'], []);
goog.addDependency('../../../og/src/og/planetSegment/wgs84planetSegment.js', ['og.planetSegment.Wgs84PlanetSegment'], ['og.LonLat', 'og.inheritance', 'og.planetSegment.PlanetSegment', 'og.proj.EPSG4326']);
goog.addDependency('../../../og/src/og/proj/epsg3857.js', ['og.proj.EPSG3857'], ['og.Units', 'og.proj.Projection']);
goog.addDependency('../../../og/src/og/proj/epsg4326.js', ['og.proj.EPSG4326'], ['og.Units', 'og.proj.Projection']);
goog.addDependency('../../../og/src/og/proj/proj.js', ['og.Units', 'og.proj', 'og.proj.METERS_PER_UNIT', 'og.proj.Projection'], []);
goog.addDependency('../../../og/src/og/quadTree/quadNode.js', ['og.quadTree.QuadNode'], ['og.Extent', 'og.LonLat', 'og.planetSegment.PlanetSegmentMaterial', 'og.proj.EPSG4326', 'og.quadTree']);
goog.addDependency('../../../og/src/og/quadTree/quadTree.js', ['og.quadTree'], []);
goog.addDependency('../../../og/src/og/renderer/renderer.js', ['og.Renderer'], ['og.Camera', 'og.RendererEvents', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/renderer/rendererEvents.js', ['og.RendererEvents'], ['og.Events', 'og.inheritance', 'og.input', 'og.input.KeyboardHandler', 'og.input.MouseHandler']);
goog.addDependency('../../../og/src/og/shaderProgram/callbacks.js', ['og.shaderProgram.callbacks'], ['og.shaderProgram.types']);
goog.addDependency('../../../og/src/og/shaderProgram/overlays.js', ['og.shaderProgram.overlays'], ['og.shaderProgram', 'og.shaderProgram.ShaderProgram', 'og.shaderProgram.types', 'og.utils']);
goog.addDependency('../../../og/src/og/shaderProgram/picking.js', ['og.shaderProgram.picking'], ['og.shaderProgram', 'og.shaderProgram.ShaderProgram', 'og.shaderProgram.types']);
goog.addDependency('../../../og/src/og/shaderProgram/shaderProgram.js', ['og.shaderProgram', 'og.shaderProgram.ShaderProgram'], ['og.shaderProgram.callbacks']);
goog.addDependency('../../../og/src/og/shaderProgram/shape.js', ['og.shaderProgram.shape'], ['og.shaderProgram', 'og.shaderProgram.ShaderProgram', 'og.shaderProgram.types', 'og.utils']);
goog.addDependency('../../../og/src/og/shaderProgram/single.js', ['og.shaderProgram.single'], ['og.shaderProgram', 'og.shaderProgram.ShaderProgram', 'og.shaderProgram.types']);
goog.addDependency('../../../og/src/og/shaderProgram/skybox.js', ['og.shaderProgram.skybox'], ['og.shaderProgram', 'og.shaderProgram.ShaderProgram', 'og.shaderProgram.types', 'og.utils']);
goog.addDependency('../../../og/src/og/shaderProgram/types.js', ['og.shaderProgram.types'], []);
goog.addDependency('../../../og/src/og/shapes/baseShape.js', ['og.shapes.BaseShape'], ['og.math.Matrix4', 'og.math.Quaternion', 'og.math.Vector3']);
goog.addDependency('../../../og/src/og/shapes/sphere.js', ['og.shapes.Sphere'], ['og.shapes.BaseShape']);
goog.addDependency('../../../og/src/og/terrainProvider/terrainProvider.js', ['og.terrainProvider.TerrainProvider'], ['og.Ajax', 'og.Events', 'og.layer', 'og.quadTree']);
goog.addDependency('../../../og/src/og/utils/utils.js', ['og.utils'], ['og.Ajax']);
goog.addDependency('../../../og/src/og/webgl/framebuffer.js', ['og.webgl.Framebuffer'], ['og.ImageCanvas', 'og.webgl']);
goog.addDependency('../../../og/src/og/webgl/handler.js', ['og.webgl.Handler'], ['og.ImageCanvas', 'og.math', 'og.webgl', 'og.webgl.ShaderController']);
goog.addDependency('../../../og/src/og/webgl/shaderController.js', ['og.webgl.ShaderController'], []);
goog.addDependency('../../../og/src/og/webgl/webgl.js', ['og.webgl'], ['og.utils']);
