console.log('main.js');

YUI().use('lang', 'node', 'gallery-canvas', function (Y) {
    Y.log('YUI()', 'info');

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    var PI = 3.14159265359,
        PI60 = PI / 60,
        PI120 = PI60 * 2,
        C_NODE_3D_1 = 'node-3d-1',
        C_TEXT_BUTTON = 'text3DButton',
        C_TEXT = 'text3D',
        C_CONTROLS = 'controls',
        DOT = '.';

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    function ExtendedCanvas() {
        Y.log('ExtendedCanvas', 'info');

        var canvas,
            context,
            width,
            height,
            font,
            text;

        this.canvas = canvas;
        this.context = context;
        this.width = width;
        this.height = height;
        this.font = font;
        this.text = text;

        return this;
    }

    /******************************************************************************************************/

    ExtendedCanvas.prototype.init = function (width, height) {
        Y.log('ExtendedCanvas.init', 'info');

        this.width = width;
        this.height = height;
        this.canvas = Y.Node.create('<canvas width="' + this.width + '" height="' + this.height + '"></canvas>');
        this.context = new Y.Canvas.Context2d(this.canvas);
        return this;
    }

    /******************************************************************************************************/

    ExtendedCanvas.prototype.destroy = function () {
        Y.log('ExtendedCanvas.destroy', 'info');

        this.canvas.remove(true);
        delete this.context;
        this.width = null;
        this.height = null;
        this.font = null;
        this.text = null;
    }

    /******************************************************************************************************/

    ExtendedCanvas.prototype.setText = function (text, font) {
        Y.log('ExtendedCanvas.setText', 'info');

        this.text = text;
        this.font = font;

        var words = this.text.replace(/([^ ])\n/g, "$1 \n").split(/ /),
            line = '',
            fontSize = 20,
            fontStep = 6,
            x = 10,
            y,
            lineHeight,
            maxWidth = 0,
            maxHeight = 0,
            testNode,
            testContext,
            testLine,
            n;

        while (maxWidth < this.width * 1.02 && maxHeight < this.height) {
            maxWidth = 0;
            maxHeight = 0;
            line = "";
            testLine = "";

            if (testNode) {
                delete testContext;
                testNode.remove(true);
            }
            testNode = Y.Node.create('<canvas width="' + this.width + '" height="' + this.height + '"></canvas>');
            testContext = new Y.Canvas.Context2d(testNode);

            fontSize += fontStep;
            testContext.set('font', fontSize + "px " + this.font);
            y = fontSize;
            lineHeight = fontSize * 1.1;

            for (n = 0; n < words.length; n++) {
                testLine = line + words[n] + ' ';
                if (testContext.measureText(testLine).width > this.width || words[n].match(/\n/g) != null) {
                    if (testContext.measureText(line).width > maxWidth) {
                        maxWidth = testContext.measureText(line).width;
                    }
                    testContext.fillText(line, x, y);
                    line = Y.Lang.trim(words[n]) + ' ';
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }
            maxHeight = y + fontSize * 0.33;
            testContext.fillText(line, x, y);
        }

        fontSize -= fontStep;
        y = fontSize;
        this.context.set('font', fontSize + "px " + this.font);
        testLine = "";
        line = "";
        lineHeight = fontSize * 1.1;

        for (var n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            if (this.context.measureText(testLine).width > this.width || words[n].match(/\n/g) != null) {
                this.context.fillText(line, x, y);
                line = Y.Lang.trim(words[n]) + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        this.context.fillText(line, x, y);
    }

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    var SketchupClass = function () {
        var fileName,
            sketchUp,
            selected = false,
            selectable = false;

        Y.log('SketchupClass', 'info');

        this.fileName = fileName;
        this.sketchUp = sketchUp;
        this.selected = selected;
        this.selectable = selectable;
    }

    /******************************************************************************************************/

    SketchupClass.prototype.init = function (fileName, p, callback) {
        Y.log('SketchupClass.init', 'info');

        this.fileName = fileName;
        var self = this,
            loader = new THREE.ColladaLoader();

        loader.load('img/' + this.fileName + '.dae', function (result) {
            self.sketchUp = result.scene;

            self.sketchUp.scale.x = 1 / 500;
            self.sketchUp.scale.y = 1 / 500;
            self.sketchUp.scale.z = 1 / 500;

            self.sketchUp.rotation.x = -PI / 2;
            self.sketchUp.rotation.z = PI;

            self.sketchUp.position.y = p.y;
            self.sketchUp.position.x = p.x;
            self.sketchUp.position.z = p.z;

            callback();
        });
    }

    /******************************************************************************************************/

    SketchupClass.prototype.clock = function () {
        if (this.sketchUp) {
            this.sketchUp.rotation.z += PI120 * 0.04;
        }
    }

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    var CylinderClass = function () {
        Y.log('CylinderClass', 'info');

        var geometry,
            material,
            cylinder,
            color,
            image,
            selected = false,
            text,
            height,
            radiusTop,
            radiusBottom,
            segmentRadius,
            segmentHeight,
            openEnded = false,
            font = "sans-serif",
            motion = "none",
            selectable = false,
            p;

        this.geometry = geometry;
        this.material = material;
        this.cylinder = cylinder;
        this.color = color;
        this.image = image;
        this.selected = selected;
        this.text = text;
        this.height = height;
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.segmentRadius = segmentRadius;
        this.segmentHeight = segmentHeight;
        this.openEnded = openEnded;
        this.font = font;
        this.motion = motion;
        this.selectable = selectable;
        this.p = p;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.init = function (p) {
        Y.log('CylinderClass.init', 'info');

        this.radius = p.radius;
        this.segments = p.segments;
        this.rings = p.rings;

        this.radiusTop = p.radiusTop;
        this.radiusBottom = p.radiusBottom;
        this.segmentRadius = p.segmentRadius;
        this.segmentHeight = p.segmentHeight;
        this.openEnded = p.openEnded;
        this.color = p.color;
        this.height = p.height;

        this.geometry = new THREE.CylinderGeometry(
            this.radiusTop,
            this.radiusBottom,
            this.height,
            this.segmentRadius,
            this.segmentHeight,
            this.openEnded);

        this.geometry.dynamic = true;
        this.material = new THREE.MeshLambertMaterial({
            map:new THREE.ImageUtils.loadTexture('img/blank1024_1024.png')
        });
        this.cylinder = new THREE.Mesh(this.geometry, this.material);
        this.cylinder.position.x = p.x;
        this.cylinder.position.y = p.y;
        this.cylinder.position.z = p.z;

        this.selectable = p.selectable;

        this.cylinder.clazz = this;

        this.p = p;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.setColor = function (color) {
        Y.log('CylinderClass.setColor', 'info');

        this.material = new THREE.MeshLambertMaterial({color:color});
        this.cylinder.material = this.material;

    }

    /******************************************************************************************************/

    CylinderClass.prototype.setImage = function (imgNode) {
        Y.log('CylinderClass.setImage', 'info');

        var texture = new THREE.ImageUtils.loadTexture(imgNode.getAttribute('src'));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 2);

        this.material = new THREE.MeshBasicMaterial({
            map:texture
        });

        this.cylinder.material = this.material;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.setFont = function (font) {
        Y.log('CylinderClass.setImage', 'info');

        this.font = font;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.setText = function (text) {
        Y.log('CylinderClass.setText', 'info');

        var widthPixels,
            heightPixels,
            can,
            imgNode;

        this.text = text;

        widthPixels = 1024;
        heightPixels = 1024;

        can = new ExtendedCanvas();
        can.init(widthPixels, heightPixels);

        can.context.set('fillStyle', '#f0fff0');
        can.context.fillRect(0, 0, widthPixels, heightPixels);
        can.context.set('fillStyle', '#000');
        can.setText(this.text, this.font);

        imgNode = Canvas2Image.saveAsPNG(can.canvas.getDOMNode(), true);
        imgNode.setAttribute('width', widthPixels);
        imgNode.setAttribute('height', heightPixels);

        this.setImage(imgNode);

    }

    /******************************************************************************************************/

    CylinderClass.prototype.select = function (font) {
        Y.log('CylinderClass.select', 'info');

        this.motion = 'recede';
        this.font = font;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.deselect = function (font) {
        Y.log('CylinderClass.deselect', 'info');

        this.motion = 'none';
        this.font = font;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.setMotion = function (motion) {
        Y.log('CylinderClass.setMotion', 'info');

        this.motion = motion;
    }

    /******************************************************************************************************/

    CylinderClass.prototype.clock = function () {
        switch (this.motion) {
            case "flip" :
                if (this.selected) {
                    if (PI - this.cylinder.rotation.y > PI120) {
                        this.cylinder.rotation.y += PI60;
                    }
                } else {
                    if (this.cylinder.rotation.y > PI120) {
                        this.cylinder.rotation.y -= PI60;
                    }
                }
                break;
            case "cw":
                this.cylinder.rotation.y += PI120 / 10;
                break;
            case "ccw" :
                this.cylinder.rotation.y -= PI120 / 10;
                break;
            case "tumble":
                this.cylinder.rotation.y -= PI120 / 10;
                this.cylinder.rotation.x += PI120 / 20;
                break;
            case "recede":
                this.cylinder.position.z -= 0.05;
                this.cylinder.rotation.y -= PI120 / 10;
                this.cylinder.rotation.x += PI120 / 20;
                break;
            default:
                if (this.p.z - this.cylinder.position.z > 0.02) {
                    this.cylinder.position.z += (this.p.z - this.cylinder.position.z)*0.03;
                } else {
                    this.motion = "cw";
                }
                this.cylinder.rotation.x = this.cylinder.rotation.x * 0.97;
                this.cylinder.rotation.y = this.cylinder.rotation.y * 0.97;
                this.cylinder.rotation.z = this.cylinder.rotation.z * 0.97;
        }
    }

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    var SphereClass = function () {
        Y.log('SphereClass', 'info');

        var geometry,
            material,
            sphere,
            color,
            image,
            selected = false,
            text,
            radius,
            segments,
            rings,
            font = "sans-serif",
            motion = "none",
            selectable = false,
            p;

        this.geometry = geometry;
        this.material = material;
        this.sphere = sphere;
        this.color = color;
        this.image = image;
        this.selected = selected;
        this.text = text;
        this.radius = radius;
        this.segments = segments;
        this.rings = rings;
        this.font = font;
        this.motion = motion;
        this.selectable = selectable;
        this.p = p;
    }

    /******************************************************************************************************/

    SphereClass.prototype.init = function (p) {
        Y.log('SphereClass.init', 'info');

        this.radius = p.radius;
        this.segments = p.segments;
        this.rings = p.rings;
        this.color = p.color;

        this.geometry = new THREE.SphereGeometry(this.radius, this.segments, this.rings);
        this.geometry.dynamic = true;
        this.material = new THREE.MeshLambertMaterial({
            map:new THREE.ImageUtils.loadTexture('img/blank1024_1024.png')
        });
        this.sphere = new THREE.Mesh(this.geometry, this.material);
        this.sphere.position.x = p.x;
        this.sphere.position.y = p.y;
        this.sphere.position.z = p.z;

        this.selectable = p.selectable;

        this.p = p;

        this.sphere.clazz = this;
    }

    /******************************************************************************************************/

    SphereClass.prototype.setColor = function (color) {
        Y.log('SphereClass.setColor', 'info');

        this.material = new THREE.MeshLambertMaterial({color:color});
        this.sphere.material = this.material;

    }

    /******************************************************************************************************/

    SphereClass.prototype.setImage = function (imgNode) {
        Y.log('SphereClass.setImage', 'info');

        var texture = new THREE.ImageUtils.loadTexture(imgNode.getAttribute('src'));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);

        this.material = new THREE.MeshBasicMaterial({
            map:texture
        });

        this.sphere.material = this.material;
    }

    /******************************************************************************************************/

    SphereClass.prototype.setFont = function (font) {
        Y.log('SphereClass.setImage', 'info');

        this.font = font;
    }

    /******************************************************************************************************/

    SphereClass.prototype.setText = function (text) {
        Y.log('SphereClass.setText', 'info');

        var widthPixels,
            heightPixels,
            can,
            imgNode;

        this.text = text;

        widthPixels = 1024;
        heightPixels = 1024;

        can = new ExtendedCanvas();
        can.init(widthPixels, heightPixels);

        can.context.set('fillStyle', '#f0fff0');
        can.context.fillRect(0, 0, widthPixels, heightPixels);
        can.context.set('fillStyle', '#000');
        can.setText(this.text, this.font);

        imgNode = Canvas2Image.saveAsPNG(can.canvas.getDOMNode(), true);
        imgNode.setAttribute('width', widthPixels);
        imgNode.setAttribute('height', heightPixels);

        this.setImage(imgNode);

    }

    /******************************************************************************************************/

    SphereClass.prototype.setMotion = function (motion) {
        Y.log('SphereClass.setMotion', 'info');

        this.motion = motion;
    }

    /******************************************************************************************************/

    SphereClass.prototype.select = function (font) {
        Y.log('SphereClass.select', 'info');

        this.motion = 'recede';
        this.font = font;
    }

    /******************************************************************************************************/

    SphereClass.prototype.deselect = function (font) {
        Y.log('SphereClass.deselect', 'info');

        this.motion = 'none';
        this.font = font;
    }


    /******************************************************************************************************/

    SphereClass.prototype.clock = function () {
        switch (this.motion) {
            case "flip" :
                if (this.selected) {
                    if (PI - this.sphere.rotation.y > PI120) {
                        this.sphere.rotation.y += PI60;
                    }
                } else {
                    if (this.sphere.rotation.y > PI120) {
                        this.sphere.rotation.y -= PI60;
                    }
                }
                break;
            case "cw":
                this.sphere.rotation.y += PI120 / 10;
                break;
            case "ccw" :
                this.sphere.rotation.y -= PI120 / 10;
                break;
            case "tumble":
                this.sphere.rotation.y -= PI120 / 10;
                this.sphere.rotation.x += PI120 / 20;
                break;
            case "recede":
                this.sphere.position.z -= 0.05;
                this.sphere.rotation.y -= PI120 / 10;
                this.sphere.rotation.x += PI120 / 20;
                break;
            default:
                if (this.p.z - this.sphere.position.z > 0.02) {
                    this.sphere.position.z += (this.p.z - this.sphere.position.z)*0.03;
                } else {
                    this.motion = "cw";
                }
                this.sphere.rotation.x = this.sphere.rotation.x * 0.97;
                this.sphere.rotation.y = this.sphere.rotation.y * 0.97;
                this.sphere.rotation.z = this.sphere.rotation.z * 0.97;
        }
    }

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    var CubeClass = function () {
        Y.log('CubeClass', 'info');

        var geometry,
            material,
            cube,
            color,
            image,
            selected = false,
            text,
            width,
            height,
            font = "sans-serif",
            motion = "none",
            selectable = false,
            p;

        this.geometry = geometry;
        this.material = material;
        this.cube = cube;
        this.color = color;
        this.image = image;
        this.selected = selected;
        this.text = text;
        this.width = width;
        this.height = height;
        this.font = font;
        this.motion = motion;
        this.selectable = selectable;
        this.p = p;
    }

    /******************************************************************************************************/

    CubeClass.prototype.init = function (p) {

        Y.log('CubeClass.init', 'info');

        this.geometry = new THREE.CubeGeometry(p.sizeX, p.sizeY, p.sizeZ);
        this.geometry.dynamic = true;
        this.material = new THREE.MeshLambertMaterial({
            map:new THREE.ImageUtils.loadTexture('img/blank1024_1024.png')
        });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.x = p.x;
        this.cube.position.y = p.y;
        this.cube.position.z = p.z;

        this.cube.clazz = this;
        this.width = p.sizeX;
        this.height = p.sizeY;

        this.selectable = p.selectable;

        this.p = p;

    }

    /******************************************************************************************************/

    CubeClass.prototype.setColor = function (color) {
        Y.log('CubeClass.setColor', 'info');

        this.material = new THREE.MeshLambertMaterial({color:color});
        this.cube.material = this.material;
    }

    /******************************************************************************************************/

    CubeClass.prototype.setImage = function (imgNode) {
        Y.log('CubeClass.setImage', 'info');

        var img = new THREE.MeshBasicMaterial({
            map:new THREE.ImageUtils.loadTexture(imgNode.getAttribute('src'))
        });

        this.cube.material = img;
    }

    /******************************************************************************************************/

    CubeClass.prototype.clock = function () {
        switch (this.motion) {
            case "flip" :
                if (this.selected) {
                    if (PI - this.cube.rotation.y > PI120) {
                        this.cube.rotation.y += PI60;
                    }
                } else {
                    if (this.cube.rotation.y > PI120) {
                        this.cube.rotation.y -= PI60;
                    }
                }
                break;
            case "cw":
                this.cube.rotation.y += PI120 / 10;
                break;
            case "ccw" :
                this.cube.rotation.y -= PI120 / 10;
                break;
            case "tumble":
                this.cube.rotation.y -= PI120 / 10;
                this.cube.rotation.x += PI120 / 20;
                break;
            case "recede":
                this.cube.position.z -= 0.05;
                this.cube.rotation.y -= PI120 / 10;
                this.cube.rotation.x += PI120 / 20;
                break;
            default:
                if (this.p.z - this.cube.position.z > 0.02) {
                    this.cube.position.z += (this.p.z - this.cube.position.z)*0.03;
                } else {
                    this.motion = "cw";
                }
                this.cube.rotation.x = this.cube.rotation.x * 0.97;
                this.cube.rotation.y = this.cube.rotation.y * 0.97;
                this.cube.rotation.z = this.cube.rotation.z * 0.97;
        }
    }

    /******************************************************************************************************/

    CubeClass.prototype.setMotion = function (motion) {
        Y.log('CubeClass.setMotion', 'info');

        this.motion = motion;
    }

    /******************************************************************************************************/

    CubeClass.prototype.setFont = function (font) {
        Y.log('CubeClass.setFont', 'info');

        this.font = font;
    }

    /******************************************************************************************************/

    CubeClass.prototype.select = function (font) {
        Y.log('CubeClass.select', 'info');

        this.motion = 'recede';
        this.font = font;
    }

    /******************************************************************************************************/

    CubeClass.prototype.deselect = function (font) {
        Y.log('CubeClass.deselect', 'info');

        this.motion = 'none';
        this.font = font;
    }

    /******************************************************************************************************/

    CubeClass.prototype.setText = function (text) {
        Y.log('CubeClass.setText', 'info');

        var widthPixels,
            heightPixels,
            can,
            imgNode;

        this.text = text;

        widthPixels = this.width * 1024;
        heightPixels = this.height * 1024;

        can = new ExtendedCanvas();
        can.init(widthPixels, heightPixels);

        can.context.set('fillStyle', '#f0fff0');
        can.context.fillRect(0, 0, widthPixels, heightPixels);
        can.context.set('fillStyle', '#000');
        can.setText(this.text, this.font);

        imgNode = Canvas2Image.saveAsPNG(can.canvas.getDOMNode(), true);
        imgNode.setAttribute('width', widthPixels);
        imgNode.setAttribute('height', heightPixels);

        this.setImage(imgNode);
    }

    /******************************************************************************************************/

    var SceneClass = function () {
        var scene,
            container,
            camera,
            renderer,
            width,
            height,
            light,
            mouseX,
            mouseY,
            intersected;

        Y.log('SceneClass', 'info');

        this.container = container;
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.light = light;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.intersected = intersected;
    }

    /******************************************************************************************************/

    SceneClass.prototype.init = function (containerClass, cameraAngle, cameraPosition) {

        Y.log('SceneClass.init', 'info');

        this.container = Y.one(DOT + containerClass);
        this.width = parseInt(this.container.getStyle('width'));
        this.height = parseInt(this.container.getStyle('height'));

        this.scene = new THREE.Scene();

        if (!cameraPosition) {
            cameraPosition = 3;
        }

        this.camera = new THREE.PerspectiveCamera(cameraAngle, this.width / this.height, 0.1, cameraPosition * 740);

        this.camera.position.z = cameraPosition;
        this.light = new THREE.SpotLight(0xffffff, 1.5);

        this.light.position.set(cameraPosition, cameraPosition * 25, cameraPosition * 100);
        this.light.castShadow = true;

        this.light.shadowCameraNear = cameraPosition * 100;
        this.light.shadowCameraFar = this.camera.far;
        this.light.shadowCameraFov = cameraPosition * 25;

        this.light.shadowBias = -0.00022;
        this.light.shadowDarkness = 0.5;

        this.light.shadowMapWidth = 1024;
        this.light.shadowMapHeight = 1024;

        this.scene.add(new THREE.AmbientLight(0x000000));
        this.scene.add(this.light);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        this.container.append(this.renderer.domElement);

        this.registerEvents();
    }

    /******************************************************************************************************/

    SceneClass.prototype.registerEvents = function () {
        var self = this,
            baseX = parseInt(self.container.getX()),
            baseY = parseInt(self.container.getY());

        self.container.on('mousemove', function (e) {
            self.mouseX = 2 * (e.clientX - baseX) / self.width - 1;
            self.mouseY = 1 - 2 * (e.clientY - baseY) / self.height;
            self.intersect();
        });

        self.container.on('click', function (e) {
            self.click();
        });
    }

    /******************************************************************************************************/

    SceneClass.prototype.intersect = function () {

        var self = this,
            vector = new THREE.Vector3(self.mouseX, self.mouseY, 1),
            ray,
            projector = new THREE.Projector(),
            intersectedList;

        projector.unprojectVector(vector, self.camera);
        ray = new THREE.Ray(self.camera.position, vector.subSelf(self.camera.position).normalize());
        intersectedList = ray.intersectObjects(self.scene.children);

        if (intersectedList.length > 0) {
            if (this.intersected != intersectedList[ 0 ].object) {
                if (this.intersected) {
                    //this.intersected.clazz.setColor(0x900000);
                }
                this.intersected = intersectedList[ 0 ].object;
                //this.intersected.clazz.setColor(0x909000);
            }
        } else {
            if (this.intersected) {
                //this.intersected.clazz.setColor(0x900000);
                this.intersected = null;
            }
        }
    }

    /******************************************************************************************************/

    SceneClass.prototype.click = function () {

        if (this.intersected && this.intersected.clazz.selectable) {
            if (this.intersected.clazz.selected) {
                this.intersected.clazz.selected = false;
                this.intersected.clazz.deselect();
            } else {
                this.intersected.clazz.selected = true;
                this.intersected.clazz.select();
            }
        }
    }

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    function main() {
        Y.log('main', 'info');

        var self = this,
            scene1 = new SceneClass(),

            myCube = new CubeClass(),
            mySphere = new SphereClass(),
            myCylinder = new CylinderClass(),
            mySketchup = new SketchupClass();

        scene1.init(C_NODE_3D_1, 50);

        self.mySphere = mySphere;
        self.myCube = myCube;
        self.myCylinder = myCylinder;
        self.mySketchup = mySketchup;

        self.scene1 = scene1;

        /* -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */

        mySphere.init({
            radius:1.5,
            segments:32,
            rings:32,
            x:-4,
            y:1.2,
            z:-4,
            color:0x909090,
            selectable:true
        });

        mySphere.setMotion('cw');

        scene1.scene.add(mySphere.sphere);

        /* -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */

        myCube.init({
            sizeX:2,
            sizeY:2,
            sizeZ:2,
            x:0.25,
            y:1.2,
            z:-3.5,
            color:0x909090,
            selectable:true
        });

        myCube.setMotion('cw');

        scene1.scene.add(myCube.cube);

        /* -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */

        myCylinder.init({
            radiusTop:1,
            radiusBottom:1,
            height:2,
            segmentRadius:32,
            segmentHeight:1,
            openEnded:false,
            x:4,
            y:1.2,
            z:-3,
            color:0x909090,
            selectable:true
        });

        myCylinder.setMotion('cw');

        scene1.scene.add(myCylinder.cylinder);

        /* -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */

        mySketchup.init('kilgour', {
            x:3.5,
            y:-3,
            z:-10
        }, function () {
            self.scene1.scene.add(self.mySketchup.sketchUp);
        });

        /* -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */

        function render() {
            requestAnimationFrame(render);
            myCube.clock();
            mySketchup.clock();
            mySphere.clock();
            myCylinder.clock();

            scene1.renderer.render(scene1.scene, scene1.camera);
        }

        render();

        // Controls

        Y.one(DOT + C_TEXT_BUTTON).on('click', function (e) {
            self.myCube.setText(Y.one(DOT + C_TEXT).get('value'));
            self.mySphere.setText(Y.one(DOT + C_TEXT).get('value'));
            self.myCylinder.setText(Y.one(DOT + C_TEXT).get('value'));
        });

        Y.all(DOT + C_CONTROLS + ' img').each(function (node) {
            node.on('mouseover', function (e) {
                e.currentTarget.setStyle('borderColor', 'red');
            });

            node.on('mouseout', function (e) {
                e.currentTarget.setStyle('borderColor', '#909090');
            });

            node.on('click', function (e) {
                self.myCube.setImage(e.currentTarget);
                self.mySphere.setImage(e.currentTarget);
                self.myCylinder.setImage(e.currentTarget);
            });
        });
    }

    /******************************************************************************************************/
    /******************************************************************************************************/
    /******************************************************************************************************/

    Y.on('domready', function () {
        Y.log('domready', 'info');
        main();
    });
});
