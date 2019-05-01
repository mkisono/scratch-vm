const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const THREE = require('three');

class ThetaBlocks {
    constructor(runtime) {
        this.runtime = runtime;
        this.createDrawable()
    }

    getInfo() {
        return {
            id: 'theta',
            name: 'Scratch 360',
            blocks: [
                {
                    opcode: 'writeLog',
                    blockType: BlockType.COMMAND,
                    text: 'log [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "hello"
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });
    }

    createDrawable() {
        const layerGroup = {
            testPattern: 'testPattern',
            cursor: 'cursor'
        };
        this.runtime.renderer.setLayerGroupOrdering([layerGroup.testPattern, layerGroup.cursor]);

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(480, 360);

        var camera = new THREE.PerspectiveCamera(45, 1, 1, 500);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        var scene = new THREE.Scene();

        var geometry = new THREE.BoxGeometry(20, 20, 20);
        geometry.rotateX(2.0)
        geometry.rotateY(2.0)
        const material = new THREE.MeshNormalMaterial();
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        var light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);

        renderer.render(scene, camera);

        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 360;

        this.loadImage(renderer.domElement.toDataURL()).then(res => {
            var ctx = canvas.getContext('2d');
            ctx.drawImage(res, 0, 0);
            const skinId = this.runtime.renderer.createBitmapSkin(canvas, 1);
            const drawableId = this.runtime.renderer.createDrawable(layerGroup.testPattern);
            this.runtime.renderer.updateDrawableProperties(drawableId, { skinId });
        }).catch(e => {
            console.error(e);
        });
    };

    writeLog(args) {
        renderer = this.runtime.renderer;
        log.log(renderer);
        log.log(renderer.canvas);
    }
}

module.exports = ThetaBlocks;
