const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const log = require("../../util/log");
const THREE = require("three");

class ThetaBlocks {
    constructor(runtime) {
        this.runtime = runtime;
        this.createDrawable();
    }

    getInfo() {
        return {
            id: "theta",
            name: "Scratch 360",
            blocks: [
                {
                    opcode: "writeLog",
                    blockType: BlockType.COMMAND,
                    text: "log [TEXT]",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "hello"
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

    createDrawable() {
        const layerGroup = {
            testPattern: "testPattern",
            cursor: "cursor"
        };
        this.runtime.renderer.setLayerGroupOrdering([
            layerGroup.testPattern,
            layerGroup.cursor
        ]);

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
                this.skinId = this.runtime.renderer.createBitmapSkin(
                    canvas,
                    1
                );
                const drawableId = this.runtime.renderer.createDrawable(
                    layerGroup.testPattern
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
        requestAnimationFrame( this.animate.bind(this) );
        this.cube.rotation.x += 0.005;
        this.cube.rotation.y += 0.01;
        log.log(this.cube)
        this.renderer.render( this.scene, this.camera );
        // this.runtime.requestRedraw();

        canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 360;

        this.loadImage(this.renderer.domElement.toDataURL())
            .then(res => {
                var ctx = canvas.getContext("2d");
                ctx.drawImage(res, 0, 0);
                this.runtime.renderer.updateBitmapSkin(this.skinId, canvas, 1)
            })
            .catch(e => {
                console.error(e);
            });    
    }
    writeLog(args) {
        this.animate()
        // log.log(renderer);
        // log.log(renderer.canvas);
    }
}

module.exports = ThetaBlocks;
