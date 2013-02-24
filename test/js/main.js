YUI().use('node', function (Y) {

    var DOT = '.',
        C_TEST_CONTAINER = 'test-container',
        C_RIGHT_SIDE = 'right-side',
        C_IMAGE_CONTAINER = 'image-container',
        C_DEVICE_CONTAINER = 'device-container',
        PI = 3.1416;

    /*******************************************************************************/

    function init() {
        var images = Y.one(DOT + C_RIGHT_SIDE).all(DOT + C_IMAGE_CONTAINER);
        
        images.item(0).append('<img src="img/oclc_512_512.png" width="100" height="100">');
        images.item(1).append('<img src="img/worldcat_512_512.png" width="100" height="100">');
        images.item(2).append('<img src="img/oclc1_512_512.png" width="100" height="100">');
        images.item(3).append('<img src="img/worldshare_512_512.png" width="100" height="100">');


        for (var i = 0; i < 4; i++) {
            images.item(i).on('click', function (e) {
                var src = e.currentTarget.one('img').getAttribute('src');
                Y.fire('changeImage', {src:src})
            });
        }
    }

    /*******************************************************************************/

    function Cube() {
        var geometry,
            material,
            faceImage,
            cube;

        this.geometry = geometry;
        this.material = material;
        this.faceImage = faceImage;
        this.cube = cube;
    }

    Cube.prototype.init = function (imageFile) {
        this.geometry = new THREE.CubeGeometry(3, 3, 3);
        this.material = new THREE.MeshLambertMaterial({color:0x909090});
        this.faceImage = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
            map:THREE.ImageUtils.loadTexture(imageFile)
        });
        //this.faceImage.map.needsUpdate = true; //ADDED
        this.cube = new THREE.Mesh(this.geometry, this.faceImage);
    }

    /*******************************************************************************/

    function Scene() {
        var container,
            width,
            height,
            scene,
            camera,
            renderer,
            light;

        this.container = container;
        this.width = width;
        this.height = height;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.light = light;
    }

    Scene.prototype.init = function (nodeClass, cameraAngle) {
        this.container = Y.one(DOT + nodeClass);
        this.width = parseInt(this.container.getStyle('width'));
        this.height = parseInt(this.container.getStyle('height'));
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(cameraAngle, this.width / this.height, .1, 200);
        this.renderer = new THREE.WebGLRenderer();
        this.light = new THREE.SpotLight(0xffffff, 1.5);

        this.renderer.setSize(this.width, this.height);
        this.container.append(this.renderer.domElement);

        this.light.position.set(0, 500, 2000);
        this.light.castShadow = true;

        this.light.shadowCameraNear = 200;
        this.light.shadowCameraFar = self.myScene.camera.far;
        this.light.shadowCameraFov = 50;

        this.light.shadowBias = -0.00022;
        this.light.shadowDarkness = 0.5;

        this.light.shadowMapWidth = 1024;
        this.light.shadowMapHeight = 1024;

        this.scene.add(new THREE.AmbientLight(0x555555));
        this.scene.add(this.light);
        this.camera.position.z = 5;

    }

    /*******************************************************************************/
    
    function main() {
        var self = this,
            myScene = new Scene,
            myCube = new Cube,

            scene2 = new Scene,
            cube2 = [],
            j, angle, x , y,
            cameraAngle = 0;

        self.cameraAngle = cameraAngle;

        self.myCube = myCube;
        self.myScene = myScene;

        self.scene2 = scene2;
        self.cube2 = cube2;

        myCube.init('img/oclc_512_512.png');
        myScene.init(C_TEST_CONTAINER,60);
        myScene.scene.add(this.myCube.cube);

        scene2.init(C_DEVICE_CONTAINER,50);

        for (j=0; j<12; j++) {
            cube2[j] = new Cube;
            cube2[j].init('img/oclc_512_512.png');
            angle = 2*PI*(j+1)/12;
            x = parseInt(Math.sin(angle)*15);
            y = parseInt(Math.cos(angle)*15);
            Y.log("(x,y) : ("+x+","+y+")");
            cube2[j].cube.translateX(x);
            cube2[j].cube.translateZ(y-15);
            cube2[j].cube.rotation.y = angle;
            scene2.scene.add(cube2[j].cube);
        }

        function render() {
            requestAnimationFrame(render);
            myScene.renderer.render(myScene.scene, myScene.camera);
            myCube.cube.rotation.x += 0.01;
            myCube.cube.rotation.y += 0.01;

            scene2.renderer.render(scene2.scene, scene2.camera);
            self.cameraAngle += 0.01;
            if (self.cameraAngle > 2*PI) {
                self.cameraAngle = 0;
            }

            var x = Math.sin(self.cameraAngle)*20;
            var z = Math.cos(self.cameraAngle)*20-15;
            scene2.camera.position.x = x;
            scene2.camera.position.z = z;
            scene2.camera.rotation.y = self.cameraAngle;

        }

        render();

        function change2(myCube,imageFile) {
            faceImage = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
                map:THREE.ImageUtils.loadTexture(imageFile)
            });
            //faceImage.map.needsUpdate = true; //ADDED
            myCube.material = faceImage;

        }

        function change(myScene,myCube,imageFile) {
            var x = myCube.cube.rotation.x,
                y = myCube.cube.rotation.y;

            myScene.scene.remove(myCube.cube);
            myCube.init(imageFile);
            myCube.cube.rotation.x = x + 0.01;
            myCube.cube.rotation.y = y + 0.01;
            myScene.scene.add(myCube.cube);
        }

        Y.on('changeImage', function (e) {
            Y.log('Change to ' + e.src);
            
            change(self.myScene,self.myCube, e.src);

            for (j=0; j<12; j++) {
                change2(self.cube2[j].cube, e.src);
            }
            
        });

    }

    /*******************************************************************************/

    Y.on('domready', function () {
        init();
        main();
    });
});