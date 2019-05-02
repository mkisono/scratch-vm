const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const log = require("../../util/log");
const THREE = require("three");
const img = require("./R0010615.jpg");

class Scratch3DBlocks {
    constructor(runtime) {
        this.runtime = runtime;
        this.layerGroup = {
            testPattern: "testPattern",
            cursor: "cursor"
        };
        this.runtime.renderer.setLayerGroupOrdering([
            this.layerGroup.testPattern,
            this.layerGroup.cursor
        ]);
    }

    getInfo() {
        return {
            id: "scratch360",
            name: "Scratch 360",
            blocks: [
                {
                    opcode: "box",
                    blockType: BlockType.COMMAND,
                    text: "box"
                },
                {
                    opcode: "theta",
                    blockType: BlockType.COMMAND,
                    text: "theta"
                }
            ],
            menus: {}
        };
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = e => reject(e);
            img.src = src;
        });
    }

    init() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(480, 360);

        this.camera = new THREE.PerspectiveCamera(45, 1, 1, 500);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);

        this.scene = new THREE.Scene();

        var geometry = new THREE.BoxGeometry(20, 20, 20);
        geometry.rotateX(2.0);
        geometry.rotateY(2.0);
        const material = new THREE.MeshNormalMaterial();
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        var light = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(light);

        this.renderer.render(this.scene, this.camera);

        canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 360;

        this.loadImage(this.renderer.domElement.toDataURL())
            .then(res => {
                var ctx = canvas.getContext("2d");
                ctx.drawImage(res, 0, 0);
                this.skinId = this.runtime.renderer.createBitmapSkin(canvas, 1);
                const drawableId = this.runtime.renderer.createDrawable(
                    this.layerGroup.testPattern
                );
                this.runtime.renderer.updateDrawableProperties(drawableId, {
                    skinId: this.skinId
                });
            })
            .catch(e => {
                console.error(e);
            });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.cube.rotation.x += 0.005;
        this.cube.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
        // this.runtime.requestRedraw();

        canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 360;

        this.loadImage(this.renderer.domElement.toDataURL())
            .then(res => {
                var ctx = canvas.getContext("2d");
                ctx.drawImage(res, 0, 0);
                this.runtime.renderer.updateBitmapSkin(this.skinId, canvas, 1);
            })
            .catch(e => {
                console.error(e);
            });
    }

    box() {
        this.init();
        this.animate();
    }

    theta_init() {
        // https://threejs.org/examples/webgl_panorama_equirectangular.html
        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;

        this.theta_camera = new THREE.PerspectiveCamera(75, 480 / 360, 1, 1100);
        this.theta_camera.target = new THREE.Vector3(0, 0, 0);

        this.theta_scene = new THREE.Scene();

        var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);

    
        var texture = new THREE.TextureLoader().load(img);
        var material = new THREE.MeshBasicMaterial({ map: texture });

        this.theta_mesh = new THREE.Mesh(geometry, material);

        this.theta_scene.add(this.theta_mesh);

        this.theta_renderer = new THREE.WebGLRenderer();
        this.theta_renderer.setSize(480, 360);

        // renderer.setPixelRatio( window.devicePixelRatio );
        this.theta_renderer.render(this.theta_scene, this.theta_camera);

        this.canvas = document.createElement("canvas");
        this.canvas.width = 480;
        this.canvas.height = 360;

        this.loadImage(this.theta_renderer.domElement.toDataURL())
            .then(res => {
                this.ctx = this.canvas.getContext("2d");
                this.ctx.drawImage(res, 0, 0);
                this.skinId = this.runtime.renderer.createBitmapSkin(this.canvas, 1);
                const drawableId = this.runtime.renderer.createDrawable(
                    this.layerGroup.testPattern
                );
                this.runtime.renderer.updateDrawableProperties(drawableId, {
                    skinId: this.skinId
                });
            })
            .catch(e => {
                console.error(e);
            });
    }

    theta_animate() {
        requestAnimationFrame(this.theta_animate.bind(this));
        this.lon += 0.5;
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.theta = THREE.Math.degToRad(this.lon);

        this.theta_camera.target.x =
            500 * Math.sin(this.phi) * Math.cos(this.theta);
        this.theta_camera.target.y = 500 * Math.cos(this.phi);
        this.theta_camera.target.z =
            500 * Math.sin(this.phi) * Math.sin(this.theta);

        this.theta_camera.lookAt(this.theta_camera.target);

        /*
        // distortion
        camera.position.copy( camera.target ).negate();
        */

        this.theta_renderer.render(this.theta_scene, this.theta_camera);

        // canvas = document.createElement("canvas");
        // canvas.width = 480;
        // canvas.height = 360;

        this.loadImage(this.theta_renderer.domElement.toDataURL())
            .then(res => {
                // var ctx = this.canvas.getContext("2d");
                this.ctx.drawImage(res, 0, 0);
                this.runtime.renderer.updateBitmapSkin(this.skinId, this.canvas, 1);
            })
            .catch(e => {
                console.error(e);
            });
    }

    theta() {
        this.theta_init();
        this.theta_animate();
    }
}

module.exports = Scratch3DBlocks;
