const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const Cast = require("../../util/cast");
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
        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;
        this.isUserInteracting = false;
        this.onMouseDownMouseX = 0;
        this.onMouseDownMouseY = 0;
        this.onMouseDownLon = 0;
        this.onMouseDownLat = 0;
        this.interval = 0.1;
    }

    getInfo() {
        return {
            id: "scratch360",
            name: "Scratch 360",
            blocks: [
                {
                    opcode: "thetaViewer",
                    blockType: BlockType.COMMAND,
                    text: "360°写真をぐるぐる回す"
                },
                {
                    opcode: "speed",
                    blockType: BlockType.COMMAND,
                    text: "回転スピード [INTERVAL]",
                    arguments: {
                        INTERVAL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1
                        }
                    }
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
        // https://threejs.org/examples/webgl_panorama_equirectangular.html
        this.camera = new THREE.PerspectiveCamera(75, 480 / 360, 1, 2000);
        // this.camera.position.set(0, 0, 1000);
        this.camera.target = new THREE.Vector3(0, 0, 0);

        this.scene = new THREE.Scene();
        var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);
        var texture = new THREE.TextureLoader().load(img);
        var material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(480, 360);
        this.renderer.render(this.scene, this.camera);

        document.addEventListener(
            "mousedown",
            this.onPointerStart.bind(this),
            false
        );
        document.addEventListener(
            "mousemove",
            this.onPointerMove.bind(this),
            false
        );
        document.addEventListener(
            "mouseup",
            this.onPointerUp.bind(this),
            false
        );

        document.addEventListener(
            "wheel",
            this.onDocumentMouseWheel.bind(this),
            false
        );

        document.addEventListener(
            "touchstart",
            this.onPointerStart.bind(this),
            false
        );
        document.addEventListener(
            "touchmove",
            this.onPointerMove.bind(this),
            false
        );
        document.addEventListener(
            "touchend",
            this.onPointerUp.bind(this),
            false
        );

        this.canvas = document.createElement("canvas");
        this.canvas.width = 480;
        this.canvas.height = 360;

        this.loadImage(this.renderer.domElement.toDataURL())
            .then(res => {
                this.ctx = this.canvas.getContext("2d");
                this.ctx.drawImage(res, 0, 0);
                this.skinId = this.runtime.renderer.createBitmapSkin(
                    this.canvas,
                    1
                );
                const drawableId = this.runtime.renderer.createDrawable(
                    this.layerGroup.testPattern
                );
                this.runtime.renderer.updateDrawableProperties(drawableId, {
                    skinId: this.skinId
                });
            })
            .catch(e => console.error(e));
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if (this.isUserInteracting === false) {
            this.lon += this.interval;
        }
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.theta = THREE.Math.degToRad(this.lon);

        // this.mesh.rotation.x += 0.005;
        // this.mesh.rotation.y += 0.01;

        this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.target.y = 500 * Math.cos(this.phi);
        this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.lookAt(this.camera.target);
        this.renderer.render(this.scene, this.camera);

        this.loadImage(this.renderer.domElement.toDataURL())
            .then(res => {
                this.ctx.drawImage(res, 0, 0);
                this.runtime.renderer.updateBitmapSkin(
                    this.skinId,
                    this.canvas,
                    1
                );
            })
            .catch(e => console.error(e));
    }

    thetaViewer() {
        this.init();
        this.animate();
    }

    speed(args) {
        this.interval = Cast.toNumber(args.INTERVAL);
    }

    onPointerStart(event) {
        this.isUserInteracting = true;
        var clientX = event.clientX || event.touches[0].clientX;
        var clientY = event.clientY || event.touches[0].clientY;
        this.onMouseDownMouseX = clientX;
        this.onMouseDownMouseY = clientY;
        this.onMouseDownLon = this.lon;
        this.onMouseDownLat = this.lat;
    }

    onPointerMove(event) {
        if (this.isUserInteracting === true) {
            var clientX = event.clientX || event.touches[0].clientX;
            var clientY = event.clientY || event.touches[0].clientY;
            this.lon =
                (this.onMouseDownMouseX - clientX) * 0.1 + this.onMouseDownLon;
            this.lat =
                (clientY - this.onMouseDownMouseY) * 0.1 + this.onMouseDownLat;
        }
    }

    onPointerUp() {
        this.isUserInteracting = false;
    }

    onDocumentMouseWheel(event) {
        var fov = this.camera.fov + event.deltaY * 0.05;
        this.camera.fov = THREE.Math.clamp(fov, 10, 75);
        this.camera.updateProjectionMatrix();
    }
}

module.exports = Scratch3DBlocks;
