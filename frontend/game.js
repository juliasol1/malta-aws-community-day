// The Great Maltese Sky Bridge - 2.5D Isometric World (Age of Empires III Style)
// Fullscreen High-Fidelity 3D Simulation with Maltese Architecture, Ships & Living World
// AWS (eu-central-1) <== Interconnect ==> Azure (germanywestcentral)

class MaltaIsometricScene {
    constructor() {
        this.container = document.getElementById('viewport');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // 1. Scene & Renderer (Fullscreen WebGL)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#080E18');
        this.scene.fog = new THREE.FogExp2('#080E18', 0.0035);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.container.appendChild(this.renderer.domElement);

        // 2. Isometric Orthographic Camera (AoE3 Classical View)
        const aspect = this.width / this.height;
        const d = 58;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1200);
        this.defaultCamPos = new THREE.Vector3(90, 75, 90);
        this.camera.position.copy(this.defaultCamPos);
        this.camera.lookAt(0, 5, 0);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 5, 0);
        this.controls.maxPolarAngle = Math.PI / 2.15;

        // 3. Heartbeat Canvas
        this.hbCanvas = document.getElementById('heartbeatCanvas');
        this.hbCtx = this.hbCanvas.getContext('2d');
        this.hbCanvas.width = 180;
        this.hbCanvas.height = 24;
        this.hbHistory = new Array(60).fill(12);
        this.hbStep = 0;

        // 4. Procedural Textures & Materials
        this.initMaterials();

        // 5. Simulation States
        this.isInterconnectAlive = true;
        this.rtt = 2.4;
        this.txSent = 1420;
        this.txCommitted = 1420;
        this.packets = [];
        this.collapsingObjects = [];
        this.splashes = [];
        this.lightningFlash = 0;
        this.stormProgress = 0;
        this.cameraShake = 0;

        // Background Life Collections
        this.clouds = [];
        this.seagulls = [];
        this.smokeParticles = [];
        this.citizens = [];
        this.quantumMotes = [];

        // Dynamic Water & Fortress Life Systems
        this.shoreFoams = [];
        this.boatWakes = [];
        this.buoys = [];
        this.dolphins = [];
        this.brazierFires = [];
        this.waterGlints = [];
        this.seaSprayParticles = [];
        this.puddles = [];
        this.fountainWaterParticles = [];
        this.cascadeDroplets = [];
        this.seaMistSheets = [];
        this.blueHoleRipples = [];
        this.blueHoleBubbles = [];

        // 6. Build Rich 3D World
        this.buildLighting();
        this.buildMediterraneanWater();
        this.buildVallettaCitadel(); // Left (AWS)
        this.buildGozoCoastAndAzureWindow(); // Right (Azure)
        this.buildGrandViaductBridge(); // Center Interconnect
        this.buildAgeOfEmpiresHarbour(); // Docks, Galleon Ship, Luzzu, Crates, Trees

        // 7. Inject Living Background Systems & Castle Activity
        this.buildDriftingClouds();
        this.buildFlockOfSeagulls();
        this.buildLivingCitizens();
        this.buildPatrolBoat();
        this.buildChimneySmokeEmitters();

        // 8. Mediterranean Castle & Harbour Life
        this.buildSalutingBattery();
        this.buildMarketSquare();
        this.buildHarbourCraneAndLogistics();
        this.buildFireBraziers();
        this.buildMediterraneanVegetation();
        this.buildKnightsAndGuards();
        this.buildChannelNavigationBuoys();
        this.buildLeapingDolphins();

        // 9. Moisture, Wet Tide Lines & Coastal Sea Spray
        this.buildWetTideLineStones();
        this.buildCoastalSeaSprayEmitters();
        this.buildWetPuddles();
        this.buildAWSVallettaFountain();
        this.buildAzureBlueHoleAndCascade();
        this.buildAtmosphericOceanMist();

        this.setupEvents();
        this.startLiveTelemetry();
        this.clock = new THREE.Clock();

        // Start render loop
        this.animate();
    }

    initMaterials() {
        this.limestoneTex = TextureGenerator.createLimestoneTexture();
        this.roofTex = TextureGenerator.createTerracottaRoofTexture();
        this.cobbleTex = TextureGenerator.createCobblestoneTexture();
        this.woodTex = TextureGenerator.createWoodPlankTexture();
        this.waterNormal = TextureGenerator.createWaterNormalMap();

        // High-Fidelity Mediterranean Water & Props Textures
        this.waterGradMap = TextureGenerator.createMediterraneanWaterGradientMap();
        this.waterCausticsTex = TextureGenerator.createWaterCausticsTexture();
        this.waterFoamTex = TextureGenerator.createWaterFoamTexture();
        this.awningRed = TextureGenerator.createStripedAwningTexture('#DC2626', '#FFFFFF');
        this.awningBlue = TextureGenerator.createStripedAwningTexture('#0284C7', '#FFFFFF');
        this.awningGold = TextureGenerator.createStripedAwningTexture('#D97706', '#FEF3C7');
        this.malteseBannerTex = TextureGenerator.createMalteseCrossBannerTexture('#B91C1C', '#FFFFFF');
        this.azureBannerTex = TextureGenerator.createMalteseCrossBannerTexture('#0369A1', '#FEF08A');
        this.awsBannerTex = TextureGenerator.createAWSBannerTexture();
        this.azureCloudBannerTex = TextureGenerator.createAzureBannerTexture();
        this.puddleTex = TextureGenerator.createPuddleTexture();
        this.seaMistTex = TextureGenerator.createSeaMistTexture();

        // Glistening wet limestone for splash tide line
        this.matWetStone = new THREE.MeshStandardMaterial({
            map: this.limestoneTex,
            color: '#8A5A20',
            roughness: 0.15,
            metalness: 0.25
        });

        // Translucent sea spray mist material
        this.matSeaSpray = new THREE.MeshBasicMaterial({
            color: '#E0F2FE',
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Reflective sea puddle material
        this.matPuddle = new THREE.MeshStandardMaterial({
            map: this.puddleTex,
            transparent: true,
            opacity: 0.85,
            roughness: 0.04,
            metalness: 0.75,
            color: '#38BDF8',
            depthWrite: false
        });

        // Drifting low-lying coastal sea fog
        this.matSeaMist = new THREE.MeshBasicMaterial({
            map: this.seaMistTex,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Cascading cliff waterfall material
        this.matWaterStream = new THREE.MeshStandardMaterial({
            color: '#BAE6FD',
            roughness: 0.08,
            metalness: 0.25,
            transparent: true,
            opacity: 0.82
        });

        // Glowing Blue Hole grotto deep water
        this.matGrottoWater = new THREE.MeshStandardMaterial({
            color: '#0284C7',
            roughness: 0.05,
            metalness: 0.5,
            transparent: true,
            opacity: 0.92
        });

        // Valletta Baroque fountain water
        this.matFountainWater = new THREE.MeshStandardMaterial({
            color: '#38BDF8',
            roughness: 0.06,
            metalness: 0.3,
            transparent: true,
            opacity: 0.85
        });

        this.matStone = new THREE.MeshStandardMaterial({
            map: this.limestoneTex,
            roughness: 0.85,
            metalness: 0.04
        });

        this.matRoof = new THREE.MeshStandardMaterial({
            map: this.roofTex,
            roughness: 0.65,
            metalness: 0.05
        });

        this.matCobble = new THREE.MeshStandardMaterial({
            map: this.cobbleTex,
            roughness: 0.85,
            metalness: 0.08
        });

        this.matWood = new THREE.MeshStandardMaterial({
            map: this.woodTex,
            roughness: 0.85,
            metalness: 0.05
        });

        // Vibrant Mediterranean Sea Material with Depth Gradient & Translucency
        this.matWater = new THREE.MeshStandardMaterial({
            map: this.waterGradMap,
            roughness: 0.04,
            metalness: 0.32,
            normalMap: this.waterNormal,
            transparent: true,
            opacity: 0.92
        });

        this.matSail = new THREE.MeshStandardMaterial({
            color: '#F8FAFC',
            roughness: 0.9,
            side: THREE.DoubleSide
        });

        this.matSmoke = new THREE.MeshBasicMaterial({
            color: '#CBD5E1',
            transparent: true,
            opacity: 0.35
        });

        this.matFoam = new THREE.MeshBasicMaterial({
            map: this.waterFoamTex,
            transparent: true,
            opacity: 0.82,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.matBronze = new THREE.MeshStandardMaterial({
            color: '#78350F',
            roughness: 0.35,
            metalness: 0.85
        });

        this.matCannonball = new THREE.MeshStandardMaterial({
            color: '#1E293B',
            roughness: 0.4,
            metalness: 0.9
        });
    }

    buildLighting() {
        // Warm Mediterranean Sun Light (AoE3 Golden Hour)
        this.ambientLight = new THREE.HemisphereLight('#FFF0D4', '#172554', 0.72);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight('#FFF3D4', 1.45);
        this.sunLight.position.set(100, 130, 60);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 400;

        const d = 95;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.0003;
        this.sunLight.shadow.radius = 2.0;
        this.scene.add(this.sunLight);

        // Tech Point Lights for Citadels
        this.awsPoint = new THREE.PointLight('#FF9900', 4.5, 45);
        this.awsPoint.position.set(-42, 22, 0);
        this.scene.add(this.awsPoint);

        this.azurePoint = new THREE.PointLight('#0078D4', 4.5, 45);
        this.azurePoint.position.set(42, 22, 0);
        this.scene.add(this.azurePoint);
    }

    buildMediterraneanWater() {
        const waterGeo = new THREE.PlaneGeometry(360, 360, 64, 64);
        this.waterMesh = new THREE.Mesh(waterGeo, this.matWater);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.y = 0.5;
        this.waterMesh.receiveShadow = true;
        this.scene.add(this.waterMesh);

        // Dynamic Caustics Layer on Mediterranean Seabed
        const causticsMat = new THREE.MeshBasicMaterial({
            map: this.waterCausticsTex,
            color: '#38BDF8',
            transparent: true,
            opacity: 0.28,
            blending: THREE.AdditiveBlending
        });
        this.causticsMesh = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), causticsMat);
        this.causticsMesh.rotation.x = -Math.PI / 2;
        this.causticsMesh.position.y = 0.44;
        this.scene.add(this.causticsMesh);

        const bedGeo = new THREE.PlaneGeometry(360, 360);
        const bedMat = new THREE.MeshBasicMaterial({ color: '#021A2C' });
        const bed = new THREE.Mesh(bedGeo, bedMat);
        bed.rotation.x = -Math.PI / 2;
        bed.position.y = -12;
        this.scene.add(bed);

        // Build Shoreline Breaking Surf & Foam Contours
        this.buildShoreFoamContours();

        // Build Sun Specular Glints on Water Surface
        this.buildWaterGlints();
    }

    buildShoreFoamContours() {
        this.shoreFoams = [];

        // 1. Valletta Harbour Quay & Spur Foam Lines
        const foamPointsValletta = [
            { x: -21, z: 0, w: 7, l: 30 },
            { x: -18, z: -18, w: 12, l: 28 },
            { x: -22, z: 20, w: 6, l: 24 },
            { x: -22, z: -32, w: 8, l: 20 }
        ];

        foamPointsValletta.forEach((pt, idx) => {
            const foam = new THREE.Mesh(
                new THREE.PlaneGeometry(pt.w, pt.l),
                this.matFoam
            );
            foam.rotation.x = -Math.PI / 2;
            foam.position.set(pt.x, 0.54, pt.z);
            foam.userData = { baseScale: 1.0, speed: 2.0 + idx * 0.4, phase: idx * 1.5 };
            this.scene.add(foam);
            this.shoreFoams.push(foam);
        });

        // 2. Gozo Cliffs & Azure Window Lagoon Foam
        const foamPointsGozo = [
            { x: 22, z: 0, w: 8, l: 32 },
            { x: 23, z: 22, w: 7, l: 24 },
            { x: 24, z: -20, w: 8, l: 26 },
            { x: 44, z: -22, w: 14, l: 14, isRing: true },
            { x: 40, z: -14, w: 10, l: 10, isRing: true }
        ];

        foamPointsGozo.forEach((pt, idx) => {
            const geo = pt.isRing 
                ? new THREE.RingGeometry(3.5, 7.5, 24)
                : new THREE.PlaneGeometry(pt.w, pt.l);
            const foam = new THREE.Mesh(geo, this.matFoam);
            foam.rotation.x = -Math.PI / 2;
            foam.position.set(pt.x, 0.54, pt.z);
            foam.userData = { baseScale: 1.0, speed: 1.8 + idx * 0.35, phase: idx * 1.2 + 2.0 };
            this.scene.add(foam);
            this.shoreFoams.push(foam);
        });

        // 3. Central Viaduct Pier Breaker Rings
        [-8, 0, 8].forEach((px, idx) => {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(2.4, 4.8, 16),
                this.matFoam
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(px, 0.54, 0);
            ring.userData = { baseScale: 1.0, speed: 2.2, phase: idx * 0.8 };
            this.scene.add(ring);
            this.shoreFoams.push(ring);
        });
    }

    buildWaterGlints() {
        this.waterGlints = [];
        const glintGeo = new THREE.PlaneGeometry(0.7, 0.7);
        const glintMat = new THREE.MeshBasicMaterial({
            color: '#FFFFFF',
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        for (let i = 0; i < 35; i++) {
            const glint = new THREE.Mesh(glintGeo, glintMat);
            glint.rotation.x = -Math.PI / 2;
            glint.rotation.z = Math.PI / 4;
            const x = (Math.random() - 0.5) * 45;
            const z = (Math.random() - 0.5) * 60;
            glint.position.set(x, 0.56, z);
            glint.userData = {
                phase: Math.random() * Math.PI * 2,
                speed: 3.0 + Math.random() * 4.0
            };
            this.scene.add(glint);
            this.waterGlints.push(glint);
        }
    }

    buildVallettaCitadel() {
        this.vallettaGroup = new THREE.Group();

        // 1. Multi-tiered Globigerina Limestone Fortress Bastions
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 85), this.matStone);
        b1.position.set(-50, 5, 0);
        b1.castShadow = true;
        b1.receiveShadow = true;
        this.vallettaGroup.add(b1);

        const b2 = new THREE.Mesh(new THREE.BoxGeometry(48, 7, 70), this.matStone);
        b2.position.set(-54, 13.5, 0);
        b2.castShadow = true;
        b2.receiveShadow = true;
        this.vallettaGroup.add(b2);

        // Angled Fort St. Elmo Spur jutting into the channel
        const spurGeo = new THREE.CylinderGeometry(16, 22, 10, 6);
        const spur = new THREE.Mesh(spurGeo, this.matStone);
        spur.position.set(-22, 5, 0);
        spur.castShadow = true;
        spur.receiveShadow = true;
        this.vallettaGroup.add(spur);

        // Crenellations (Battlements teeth) along the fortress walls
        this.buildCrenellations(-21, 10, -22, -21, 10, 22);
        this.buildCrenellations(-50, 17, -35, -30, 17, -35);
        this.buildCrenellations(-50, 17, 35, -30, 17, 35);

        // 2. Grand Cathedral of St. John & Valletta Dome
        this.buildBaroqueCathedral(-62, 17, 0);

        // 3. Dense Maltese Colonial Townhouses (like AoE3 city!)
        this.house1 = this.createColonialTownhouse(-48, 17, -20, 14, 12, 14, 0.15, '#065F46'); // Green balcony
        this.house2 = this.createColonialTownhouse(-38, 17, -22, 12, 11, 12, -0.1, '#831843'); // Crimson balcony
        this.house3 = this.createColonialTownhouse(-48, 17, 20, 13, 11, 13, 0.1, '#065F46');
        this.house4 = this.createColonialTownhouse(-38, 17, 22, 12, 10, 11, -0.2, '#1E3A8A'); // Navy balcony

        // 4. St. Elmo Watchtower Turret & Maltese Cross Flag
        const turret = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.2, 12, 8), this.matStone);
        turret.position.set(-21, 16, 14);
        turret.castShadow = true;
        this.vallettaGroup.add(turret);

        const turretRoof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 5, 8), this.matRoof);
        turretRoof.position.set(-21, 24.5, 14);
        turretRoof.castShadow = true;
        this.vallettaGroup.add(turretRoof);

        this.createMalteseFlag(-21, 27, 14);

        // 5. AWS High-Tech Graviton4 Citadel Core
        this.buildGravitonTemple(-42, 17, 0);

        this.scene.add(this.vallettaGroup);
    }

    buildCrenellations(x1, y1, z1, x2, y2, z2) {
        const count = 12;
        const dx = (x2 - x1) / count;
        const dz = (z2 - z1) / count;
        for (let i = 0; i <= count; i += 2) {
            const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), this.matStone);
            merlon.position.set(x1 + i * dx, y1 + 0.9, z1 + i * dz);
            merlon.castShadow = true;
            this.vallettaGroup.add(merlon);
        }
    }

    buildBaroqueCathedral(x, y, z) {
        const catGroup = new THREE.Group();
        catGroup.position.set(x, y, z);

        // Nave body
        const nave = new THREE.Mesh(new THREE.BoxGeometry(22, 16, 16), this.matStone);
        nave.position.y = 8;
        nave.castShadow = true;
        catGroup.add(nave);

        // Pitched Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(17, 7, 4), this.matRoof);
        roof.position.y = 19.5;
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.1, 1, 0.8);
        roof.castShadow = true;
        catGroup.add(roof);

        // Great Carmelite Ribbed Dome
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.5, 7, 16), this.matStone);
        drum.position.set(2, 21.5, 0);
        drum.castShadow = true;
        catGroup.add(drum);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(6.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), this.matRoof);
        dome.position.set(2, 25, 0);
        catGroup.add(dome);

        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 4, 8), this.matStone);
        lantern.position.set(2, 33, 0);
        catGroup.add(lantern);

        // Twin Bell Towers (Front Facade)
        [-8, 8].forEach(tz => {
            const tower = new THREE.Mesh(new THREE.BoxGeometry(5.5, 26, 5.5), this.matStone);
            tower.position.set(11, 13, tz);
            tower.castShadow = true;
            catGroup.add(tower);

            const spire = new THREE.Mesh(new THREE.ConeGeometry(3.6, 8, 4), this.matRoof);
            spire.position.set(11, 30, tz);
            spire.rotation.y = Math.PI / 4;
            catGroup.add(spire);

            const belfry = new THREE.Mesh(
                new THREE.SphereGeometry(1.2, 8, 8),
                new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.8, roughness: 0.3 })
            );
            belfry.position.set(11, 23, tz);
            catGroup.add(belfry);
        });

        this.vallettaGroup.add(catGroup);
    }

    createColonialTownhouse(x, y, z, w, h, d, rotY, balconyColor) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.y = rotY;

        const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.matStone);
        house.position.y = h / 2;
        house.castShadow = true;
        house.receiveShadow = true;
        group.add(house);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 4.5, 4), this.matRoof);
        roof.position.y = h + 2.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Balcony
        const balcGeo = new THREE.BoxGeometry(w * 0.45, 3.2, 2.0);
        const balcMat = new THREE.MeshStandardMaterial({ color: balconyColor, roughness: 0.45 });
        const balcony = new THREE.Mesh(balcGeo, balcMat);
        balcony.position.set(0, h * 0.58, d / 2 + 1.0);
        balcony.castShadow = true;
        group.add(balcony);

        // Glass
        const glassGeo = new THREE.BoxGeometry(w * 0.42, 1.8, 0.1);
        const glassMat = new THREE.MeshBasicMaterial({ color: '#FEF08A' });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(0, h * 0.58 + 0.3, d / 2 + 2.05);
        group.add(glass);

        // Chimney
        const chim = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.5, 1.2), this.matStone);
        chim.position.set(w * 0.28, h + 3.8, d * 0.2);
        group.add(chim);

        this.vallettaGroup.add(group);
        return { group, chimWorldPos: new THREE.Vector3(x + w * 0.28, y + h + 5.5, z + d * 0.2) };
    }

    createMalteseFlag(x, y, z) {
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 9),
            new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.85 })
        );
        pole.position.set(x, y + 4.5, z);
        this.vallettaGroup.add(pole);

        const flagGeo = new THREE.PlaneGeometry(4.2, 2.8, 10, 6);
        const fc = document.createElement('canvas');
        fc.width = 128;
        fc.height = 64;
        const fctx = fc.getContext('2d');
        fctx.fillStyle = '#FFFFFF';
        fctx.fillRect(0, 0, 64, 64);
        fctx.fillStyle = '#DC2626';
        fctx.fillRect(64, 0, 64, 64);
        fctx.strokeStyle = '#475569';
        fctx.lineWidth = 3;
        fctx.strokeRect(10, 10, 18, 18);

        const flagMat = new THREE.MeshStandardMaterial({
            map: new THREE.CanvasTexture(fc),
            side: THREE.DoubleSide
        });
        this.malteseFlagMesh = new THREE.Mesh(flagGeo, flagMat);
        this.malteseFlagMesh.position.set(x + 2.1, y + 7.5, z);
        this.vallettaGroup.add(this.malteseFlagMesh);
    }

    buildGravitonTemple(x, y, z) {
        const tGroup = new THREE.Group();
        tGroup.position.set(x, y, z);

        const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(6, 7.5, 6, 8), this.matStone);
        rotunda.position.y = 3;
        rotunda.castShadow = true;
        tGroup.add(rotunda);

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 7, 8), this.matStone);
            col.position.set(Math.cos(angle) * 5.2, 8.5, Math.sin(angle) * 5.2);
            col.castShadow = true;
            tGroup.add(col);
        }

        this.gravitonCore = new THREE.Mesh(
            new THREE.OctahedronGeometry(3.5),
            new THREE.MeshStandardMaterial({
                color: '#FF9900',
                emissive: '#FF9900',
                emissiveIntensity: 1.0,
                roughness: 0.15
            })
        );
        this.gravitonCore.position.set(0, 8.5, 0);
        tGroup.add(this.gravitonCore);

        const ringGeo1 = new THREE.TorusGeometry(5.2, 0.3, 8, 32);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: '#FBBF24' });
        this.gravRing1 = new THREE.Mesh(ringGeo1, ringMat1);
        this.gravRing1.position.set(0, 8.5, 0);
        this.gravRing1.rotation.x = Math.PI / 2;
        tGroup.add(this.gravRing1);

        const ringGeo2 = new THREE.TorusGeometry(6.2, 0.25, 8, 32);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: '#FF7700' });
        this.gravRing2 = new THREE.Mesh(ringGeo2, ringMat2);
        this.gravRing2.position.set(0, 8.5, 0);
        this.gravRing2.rotation.y = Math.PI / 4;
        tGroup.add(this.gravRing2);

        this.vallettaGroup.add(tGroup);
    }

    buildGozoCoastAndAzureWindow() {
        this.gozoGroup = new THREE.Group();

        // 1. Dwejra Natural Layered Rock Cliffs
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(60, 9, 85), this.matStone);
        c1.position.set(50, 4.5, 0);
        c1.castShadow = true;
        c1.receiveShadow = true;
        this.gozoGroup.add(c1);

        const c2 = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 65), this.matStone);
        c2.position.set(54, 12, 0);
        c2.castShadow = true;
        c2.receiveShadow = true;
        this.gozoGroup.add(c2);

        const spur1 = new THREE.Mesh(new THREE.CylinderGeometry(14, 19, 9, 7), this.matStone);
        spur1.position.set(22, 4.5, 0);
        spur1.castShadow = true;
        spur1.receiveShadow = true;
        this.gozoGroup.add(spur1);

        // Houses
        this.createColonialTownhouse(50, 15, -20, 13, 9, 12, -0.2, '#1E3A8A');
        this.createColonialTownhouse(58, 15, 18, 12, 8, 12, 0.1, '#831843');

        // Torri tad-Dwejra
        const dwejraTower = new THREE.Mesh(new THREE.BoxGeometry(8, 14, 8), this.matStone);
        dwejraTower.position.set(34, 12, -22);
        dwejraTower.castShadow = true;
        this.gozoGroup.add(dwejraTower);

        // 2. Azure High-Tech Research Spire (Cobalt 100 Core)
        this.buildCobaltTemple(42, 15, 0);

        // ============================================
        // 3. THE MAJESTIC AZURE WINDOW (Tieqa tad-Dwejra)
        // ============================================
        this.azureWindowGroup = new THREE.Group();
        this.azureWindowGroup.position.set(26, 0, 24);

        const pillarGeo = new THREE.CylinderGeometry(4.8, 6.5, 18, 10);
        this.archPillar = new THREE.Mesh(pillarGeo, this.matStone);
        this.archPillar.position.set(11, 9, 0);
        this.archPillar.castShadow = true;
        this.archPillar.receiveShadow = true;
        this.azureWindowGroup.add(this.archPillar);

        const archTopGeo = new THREE.BoxGeometry(22, 4.8, 8);
        this.archTop = new THREE.Mesh(archTopGeo, this.matStone);
        this.archTop.position.set(0, 18.2, 0);
        this.archTop.castShadow = true;
        this.archTop.receiveShadow = true;
        this.azureWindowGroup.add(this.archTop);

        const root = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8), this.matStone);
        root.position.set(-9, 8, 0);
        root.castShadow = true;
        this.azureWindowGroup.add(root);

        this.gozoGroup.add(this.azureWindowGroup);
        this.scene.add(this.gozoGroup);
    }

    buildCobaltTemple(x, y, z) {
        const cGroup = new THREE.Group();
        cGroup.position.set(x, y, z);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 7.5, 6, 8), this.matStone);
        base.position.y = 3;
        base.castShadow = true;
        cGroup.add(base);

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 7, 8), this.matStone);
            col.position.set(Math.cos(angle) * 5.2, 8.5, Math.sin(angle) * 5.2);
            col.castShadow = true;
            cGroup.add(col);
        }

        this.cobaltCore = new THREE.Mesh(
            new THREE.OctahedronGeometry(3.5),
            new THREE.MeshStandardMaterial({
                color: '#0078D4',
                emissive: '#0078D4',
                emissiveIntensity: 1.0,
                roughness: 0.15
            })
        );
        this.cobaltCore.position.set(0, 8.5, 0);
        cGroup.add(this.cobaltCore);

        const r1 = new THREE.Mesh(
            new THREE.TorusGeometry(5.2, 0.3, 8, 32),
            new THREE.MeshBasicMaterial({ color: '#38BDF8' })
        );
        r1.position.set(0, 8.5, 0);
        r1.rotation.x = Math.PI / 2;
        this.cobaltRing1 = r1;
        cGroup.add(r1);

        const r2 = new THREE.Mesh(
            new THREE.TorusGeometry(6.2, 0.25, 8, 32),
            new THREE.MeshBasicMaterial({ color: '#0284C7' })
        );
        r2.position.set(0, 8.5, 0);
        r2.rotation.y = Math.PI / 4;
        this.cobaltRing2 = r2;
        cGroup.add(r2);

        this.gozoGroup.add(cGroup);
    }

    buildGrandViaductBridge() {
        this.bridgeGroup = new THREE.Group();
        this.bridgeSpans = [];

        const spanCount = 5;
        const spanWidth = 8.0;

        for (let i = 0; i < spanCount; i++) {
            const spanGroup = new THREE.Group();
            const posX = -16.0 + i * spanWidth;
            spanGroup.position.set(posX, 10.0, 0);

            const deck = new THREE.Mesh(new THREE.BoxGeometry(spanWidth - 0.25, 2.0, 8.5), this.matStone);
            deck.castShadow = true;
            deck.receiveShadow = true;
            spanGroup.add(deck);

            const road = new THREE.Mesh(new THREE.PlaneGeometry(spanWidth - 0.25, 6.5), this.matCobble);
            road.rotation.x = -Math.PI / 2;
            road.position.y = 1.05;
            road.receiveShadow = true;
            spanGroup.add(road);

            const fiber = new THREE.Mesh(
                new THREE.BoxGeometry(spanWidth - 0.25, 0.2, 1.0),
                new THREE.MeshBasicMaterial({ color: '#10B981' })
            );
            fiber.position.y = 1.15;
            spanGroup.add(fiber);

            const railN = new THREE.Mesh(new THREE.BoxGeometry(spanWidth - 0.25, 1.4, 0.5), this.matStone);
            railN.position.set(0, 1.7, 3.8);
            spanGroup.add(railN);

            const railS = new THREE.Mesh(new THREE.BoxGeometry(spanWidth - 0.25, 1.4, 0.5), this.matStone);
            railS.position.set(0, 1.7, -3.8);
            spanGroup.add(railS);

            if (i > 0 && i < spanCount) {
                // Solid stone pier down to water seabed
                const pier = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.6, 11, 8), this.matStone);
                pier.position.set(-spanWidth / 2, -5.5, 0);
                pier.castShadow = true;
                pier.receiveShadow = true;
                spanGroup.add(pier);

                // Flared pier capital (corbel bracket) supporting underside of deck
                const corbel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 8.4), this.matStone);
                corbel.position.set(-spanWidth / 2, -1.6, 0);
                corbel.castShadow = true;
                spanGroup.add(corbel);
            }

            this.createBridgeLantern(spanGroup, -2.5, 2.4, 3.8);
            this.createBridgeLantern(spanGroup, -2.5, 2.4, -3.8);

            this.bridgeSpans.push(spanGroup);
            this.bridgeGroup.add(spanGroup);
        }

        this.scene.add(this.bridgeGroup);
    }

    createBridgeLantern(parent, x, y, z) {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.16, 2.8),
            new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.85 })
        );
        post.position.set(x, y + 1.4, z);
        parent.add(post);

        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.75, 0.65),
            new THREE.MeshBasicMaterial({ color: '#FDE047' })
        );
        lamp.position.set(x, y + 2.8, z);
        parent.add(lamp);
    }

    buildAgeOfEmpiresHarbour() {
        // 1. Stone Quays & Wooden Docks
        const dock = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 26), this.matWood);
        dock.position.set(-18, 1.2, -18);
        dock.castShadow = true;
        dock.receiveShadow = true;
        this.scene.add(dock);

        for (let pz = -28; pz <= -8; pz += 6) {
            const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 4, 6), this.matWood);
            pile.position.set(-13, -0.8, pz);
            pile.castShadow = true;
            this.scene.add(pile);
        }

        this.createCrate(-17, 2.2, -14, 1.8);
        this.createCrate(-19, 2.2, -15, 1.5);
        this.createCrate(-17, 3.8, -14, 1.4);
        this.createCrate(-16, 2.2, -22, 2.0);

        this.createBarrel(-15, 2.2, -18);
        this.createBarrel(-15, 2.2, -20);
        this.createBarrel(-16.2, 2.2, -19);

        // 2. Mediterranean Tall Ship / Galleon (Moored safely in deep Grand Harbour water)
        this.tallShip = this.buildTallShip(-8.5, 0.8, -28, 0.15);

        // 3. Maltese Luzzu Boats
        this.luzzu1 = this.createLuzzuBoat(0, 0.6, -16, 0.25);
        this.luzzu2 = this.createLuzzuBoat(-6, 0.6, 18, -0.4);
        this.luzzu3 = this.createLuzzuBoat(8, 0.6, 22, 0.8);

        // 4. Mediterranean Cypress Trees
        this.createCypressTree(-36, 17, -10);
        this.createCypressTree(-38, 17, -8);
        this.createCypressTree(-56, 17, -30);
        this.createCypressTree(38, 15, -12);
        this.createCypressTree(44, 15, -10);
        this.createCypressTree(58, 15, 30);
    }

    createCrate(x, y, z, size) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), this.matWood);
        crate.position.set(x, y + size / 2 - 0.5, z);
        crate.castShadow = true;
        this.scene.add(crate);
    }

    createBarrel(x, y, z) {
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.85, 1.8, 8),
            new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.7 })
        );
        barrel.position.set(x, y + 0.4, z);
        barrel.castShadow = true;
        this.scene.add(barrel);
    }

    buildTallShip(x, y, z, rotY) {
        const ship = new THREE.Group();
        ship.position.set(x, y, z);
        ship.rotation.y = rotY;

        const hullGeo = new THREE.ConeGeometry(5, 24, 6);
        const hull = new THREE.Mesh(hullGeo, this.matWood);
        hull.rotation.x = Math.PI / 2;
        hull.rotation.z = Math.PI;
        hull.scale.set(0.7, 1, 0.45);
        hull.position.y = 1.2;
        hull.castShadow = true;
        ship.add(hull);

        const poop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.5, 6), this.matWood);
        poop.position.set(0, 3.2, 8);
        poop.castShadow = true;
        ship.add(poop);

        const bowsprit = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.25, 9),
            new THREE.MeshStandardMaterial({ color: '#A16207' })
        );
        bowsprit.position.set(0, 3.5, -15);
        bowsprit.rotation.x = -Math.PI / 3.5;
        ship.add(bowsprit);

        [-6, 0, 6].forEach((mz, idx) => {
            const h = idx === 1 ? 22 : 18;
            const mast = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.35, h),
                new THREE.MeshStandardMaterial({ color: '#78350F' })
            );
            mast.position.set(0, h / 2 + 1.5, mz);
            mast.castShadow = true;
            ship.add(mast);

            [0.55, 0.8].forEach(pct => {
                const yard = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.15, 8 - pct * 3),
                    new THREE.MeshStandardMaterial({ color: '#A16207' })
                );
                yard.rotation.z = Math.PI / 2;
                yard.position.set(0, h * pct + 1.5, mz);
                ship.add(yard);

                const sail = new THREE.Mesh(new THREE.BoxGeometry(7 - pct * 3, 1.4, 0.6), this.matSail);
                sail.position.set(0, h * pct + 0.8, mz);
                ship.add(sail);
            });
        });

        this.scene.add(ship);
        return ship;
    }

    createLuzzuBoat(x, y, z, rotY) {
        const boat = new THREE.Group();
        boat.position.set(x, y, z);
        boat.rotation.y = rotY;

        const hullGeo = new THREE.ConeGeometry(2.8, 8, 6);
        const hullMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.4 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.x = Math.PI / 2;
        hull.rotation.z = Math.PI;
        hull.scale.set(0.75, 1, 0.42);
        hull.castShadow = true;
        boat.add(hull);

        const yTrim = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 5.2), new THREE.MeshStandardMaterial({ color: '#F59E0B' }));
        yTrim.position.y = 0.5;
        boat.add(yTrim);

        const rTrim = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 4.8), new THREE.MeshStandardMaterial({ color: '#DC2626' }));
        rTrim.position.y = 0.75;
        boat.add(rTrim);

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 6), new THREE.MeshStandardMaterial({ color: '#78350F' }));
        mast.position.y = 3.0;
        boat.add(mast);

        this.scene.add(boat);
        return boat;
    }

    createCypressTree(x, y, z) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.45, 3),
            new THREE.MeshStandardMaterial({ color: '#451A03', roughness: 0.9 })
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(2.4, 9, 8),
            new THREE.MeshStandardMaterial({ color: '#14532D', roughness: 0.7 })
        );
        leaves.position.y = 7;
        leaves.castShadow = true;
        tree.add(leaves);

        this.scene.add(tree);
    }

    // ========================================================
    // LIVING BACKGROUND SYSTEMS (Added Life & Atmosphere)
    // ========================================================

    buildDriftingClouds() {
        const cloudMat = new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            roughness: 0.9,
            transparent: true,
            opacity: 0.75
        });

        for (let i = 0; i < 6; i++) {
            const cloud = new THREE.Group();
            const puffCount = 5 + Math.floor(Math.random() * 4);
            for (let j = 0; j < puffCount; j++) {
                const r = 4.5 + Math.random() * 4.0;
                const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), cloudMat);
                puff.position.set(
                    (Math.random() - 0.5) * 16,
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 12
                );
                cloud.add(puff);
            }
            cloud.position.set(
                -120 + Math.random() * 240,
                48 + Math.random() * 16,
                -70 + Math.random() * 140
            );
            cloud.userData = { speed: 1.2 + Math.random() * 1.5 };
            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    buildFlockOfSeagulls() {
        const gullMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.5 });
        const beakMat = new THREE.MeshBasicMaterial({ color: '#F59E0B' });

        for (let i = 0; i < 8; i++) {
            const gull = new THREE.Group();

            // Body & Head
            const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 5), gullMat);
            body.rotation.x = Math.PI / 2;
            gull.add(body);

            const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), beakMat);
            beak.rotation.x = -Math.PI / 2;
            beak.position.z = 0.9;
            gull.add(beak);

            // Left Wing
            const wingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.45);
            const wingL = new THREE.Mesh(wingGeo, gullMat);
            wingL.position.set(-0.8, 0, 0);
            const wingLPivot = new THREE.Group();
            wingLPivot.add(wingL);
            gull.add(wingLPivot);

            // Right Wing
            const wingR = new THREE.Mesh(wingGeo, gullMat);
            wingR.position.set(0.8, 0, 0);
            const wingRPivot = new THREE.Group();
            wingRPivot.add(wingR);
            gull.add(wingRPivot);

            const radius = 25 + Math.random() * 45;
            const height = 18 + Math.random() * 22;
            const speed = 0.4 + Math.random() * 0.4;
            const angle = (i / 8) * Math.PI * 2;

            gull.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
            gull.userData = {
                radius,
                height,
                speed,
                angle,
                wingLPivot,
                wingRPivot,
                flapSpeed: 10 + Math.random() * 5
            };

            this.scene.add(gull);
            this.seagulls.push(gull);
        }
    }

    buildLivingCitizens() {
        // Citizens with animated walking legs
        const waypointsList = [
            // Guard on Valletta Bastion
            { from: new THREE.Vector3(-21, 10, -18), to: new THREE.Vector3(-21, 10, 18), color: '#DC2626' },
            // Dock worker on Wooden Pier
            { from: new THREE.Vector3(-18, 2.0, -10), to: new THREE.Vector3(-18, 2.0, -25), color: '#3B82F6' },
            // Citizen on Valletta Upper Walkway
            { from: new THREE.Vector3(-46, 17.5, -28), to: new THREE.Vector3(-34, 17.5, -28), color: '#10B981' },
            // Citizen crossing the Grand Bridge!
            { from: new THREE.Vector3(-18, 11.05, 2.0), to: new THREE.Vector3(18, 11.05, 2.0), color: '#F59E0B', isBridgeWalker: true },
            // Citizen on Gozo Bluffs
            { from: new THREE.Vector3(34, 15.5, -10), to: new THREE.Vector3(48, 15.5, -10), color: '#8B5CF6' }
        ];

        waypointsList.forEach((wp, idx) => {
            const citizen = new THREE.Group();

            // Torso / Coat
            const coatMat = new THREE.MeshStandardMaterial({ color: wp.color, roughness: 0.6 });
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.5), coatMat);
            torso.position.y = 1.3;
            torso.castShadow = true;
            citizen.add(torso);

            // Head & Hat
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshStandardMaterial({ color: '#FCD34D' }));
            head.position.y = 2.0;
            citizen.add(head);

            const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 6), new THREE.MeshStandardMaterial({ color: '#1E293B' }));
            hat.position.y = 2.25;
            citizen.add(hat);

            // Left & Right Legs
            const legMat = new THREE.MeshStandardMaterial({ color: '#1E293B' });
            const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);

            const legLPivot = new THREE.Group();
            legLPivot.position.set(-0.2, 0.8, 0);
            const legL = new THREE.Mesh(legGeo, legMat);
            legL.position.y = -0.4;
            legLPivot.add(legL);
            citizen.add(legLPivot);

            const legRPivot = new THREE.Group();
            legRPivot.position.set(0.2, 0.8, 0);
            const legR = new THREE.Mesh(legGeo, legMat);
            legR.position.y = -0.4;
            legRPivot.add(legR);
            citizen.add(legRPivot);

            citizen.position.copy(wp.from);
            citizen.userData = {
                from: wp.from,
                to: wp.to,
                t: Math.random(),
                dir: 1,
                speed: 0.12 + Math.random() * 0.08,
                legLPivot,
                legRPivot,
                isBridgeWalker: !!wp.isBridgeWalker,
                falling: false,
                inWater: false,
                vy: 0,
                vx: 0,
                vz: 0,
                rotX: 0,
                rotZ: 0
            };

            this.scene.add(citizen);
            this.citizens.push(citizen);
        });
    }

    buildPatrolBoat() {
        // Active cruising Luzzu patrolling safely through the central channel
        this.patrolBoat = this.createLuzzuBoat(0, 0.6, 0, 0);
        this.patrolBoatState = {
            center: new THREE.Vector3(0, 0.6, 0),
            radiusX: 7.0,
            radiusZ: 32,
            angle: 0,
            speed: 0.28
        };
    }

    buildChimneySmokeEmitters() {
        // Collect chimney positions from townhouses
        this.smokeEmitters = [
            new THREE.Vector3(-45, 23.5, -17),
            new THREE.Vector3(-35, 22.5, -19),
            new THREE.Vector3(-45, 23.5, 23),
            new THREE.Vector3(53, 21.5, -17)
        ];
    }

    // ========================================================
    // CASTLE & CITADEL LIFE (Age of Empires / Anno 1800 Style)
    // ========================================================

    buildSalutingBattery() {
        // Upper Barrakka Grand Harbour Saluting Battery (AWS Valletta)
        const batteryPositions = [
            { x: -25, y: 10, z: -14, rotY: Math.PI / 2 },
            { x: -25, y: 10, z: -5,  rotY: Math.PI / 2 },
            { x: -25, y: 10, z: 5,   rotY: Math.PI / 2 },
            { x: -25, y: 10, z: 14,  rotY: Math.PI / 2 }
        ];

        batteryPositions.forEach(pos => {
            this.createCannon(pos.x, pos.y, pos.z, pos.rotY);
            this.createCannonballPyramid(pos.x - 2.8, pos.y, pos.z + 1.2);
        });

        // Gozo Coastal Defense Battery (Azure)
        const gozoCannons = [
            { x: 25, y: 10, z: -8, rotY: -Math.PI / 2 },
            { x: 25, y: 10, z: 8,  rotY: -Math.PI / 2 }
        ];
        gozoCannons.forEach(pos => {
            this.createCannon(pos.x, pos.y, pos.z, pos.rotY);
            this.createCannonballPyramid(pos.x + 2.8, pos.y, pos.z + 1.2);
        });

        // Maltese Fort Watchtowers (Gardjola / Vedette) with stone finials
        this.createGardjola(-22, 10, -22);
        this.createGardjola(-22, 10, 22);
        this.createGardjola(22, 10, -22);
    }

    createCannon(x, y, z, rotY) {
        const cannon = new THREE.Group();
        cannon.position.set(x, y, z);
        cannon.rotation.y = rotY;

        // Wooden carriage
        const carriage = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 3.0), this.matWood);
        carriage.position.y = 0.55;
        carriage.castShadow = true;
        cannon.add(carriage);

        // Carriage wheels
        const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.3, 12);
        wheelGeo.rotateZ(Math.PI / 2);
        [-0.9, 0.9].forEach(wx => {
            [-0.9, 0.9].forEach(wz => {
                const wheel = new THREE.Mesh(wheelGeo, this.matWood);
                wheel.position.set(wx, 0.55, wz);
                wheel.castShadow = true;
                cannon.add(wheel);
            });
        });

        // Cast Bronze Cannon Barrel with slight upward pitch
        const barrel = new THREE.Group();
        barrel.position.set(0, 1.1, -0.2);
        barrel.rotation.x = -0.08;

        const tube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.44, 3.4, 12),
            this.matBronze
        );
        tube.rotation.x = Math.PI / 2;
        tube.castShadow = true;
        barrel.add(tube);

        const muzzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.28, 0.4, 12),
            this.matBronze
        );
        muzzle.position.z = 1.8;
        muzzle.rotation.x = Math.PI / 2;
        barrel.add(muzzle);

        const cascabel = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            this.matBronze
        );
        cascabel.position.z = -1.8;
        barrel.add(cascabel);

        cannon.add(barrel);
        this.scene.add(cannon);
    }

    createCannonballPyramid(x, y, z) {
        const pyramid = new THREE.Group();
        pyramid.position.set(x, y, z);
        const r = 0.22;
        const d = r * 2;

        // Base 3x3
        for (let ix = -1; ix <= 1; ix++) {
            for (let iz = -1; iz <= 1; iz++) {
                const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), this.matCannonball);
                ball.position.set(ix * d, r, iz * d);
                ball.castShadow = true;
                pyramid.add(ball);
            }
        }
        // Middle 2x2
        for (let ix = -0.5; ix <= 0.5; ix++) {
            for (let iz = -0.5; iz <= 0.5; iz++) {
                const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), this.matCannonball);
                ball.position.set(ix * d, r + r * 1.5, iz * d);
                ball.castShadow = true;
                pyramid.add(ball);
            }
        }
        // Top 1
        const topBall = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), this.matCannonball);
        topBall.position.set(0, r + r * 3.0, 0);
        topBall.castShadow = true;
        pyramid.add(topBall);

        this.scene.add(pyramid);
    }

    createGardjola(x, y, z) {
        const gard = new THREE.Group();
        gard.position.set(x, y, z);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 3.5, 8), this.matStone);
        base.position.y = 1.75;
        base.castShadow = true;
        gard.add(base);

        const chamber = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.4, 8), this.matStone);
        chamber.position.y = 4.2;
        gard.add(chamber);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.matStone);
        dome.position.y = 5.4;
        gard.add(dome);

        this.scene.add(gard);
    }

    buildMarketSquare() {
        const marketGroup = new THREE.Group();
        marketGroup.position.set(-36, 17, 0);

        // 3 Market Stalls
        this.createMarketStall(marketGroup, 0, 0, -8, this.awningRed, 'oranges');
        this.createMarketStall(marketGroup, -3, 0, 0, this.awningBlue, 'fish');
        this.createMarketStall(marketGroup, 0, 0, 8, this.awningGold, 'wine');

        // Piles of sacks and ceramic amphorae
        for (let i = 0; i < 4; i++) {
            const sack = new THREE.Mesh(
                new THREE.SphereGeometry(0.8, 8, 8),
                new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.9 })
            );
            sack.scale.set(1, 0.7, 1);
            sack.position.set(-2 + (i % 2) * 1.2, 0.5, -4 + Math.floor(i / 2) * 1.2);
            sack.castShadow = true;
            marketGroup.add(sack);
        }

        // Townspeople chatting in the square
        this.createMarketVendor(marketGroup, 1.5, 0, -8, '#991B1B');
        this.createMarketCustomer(marketGroup, -1.8, 0, -7.5, '#1E3A8A');
        this.createMarketCustomer(marketGroup, -1.8, 0, 0.5, '#065F46');
        this.createMarketVendor(marketGroup, 1.5, 0, 8, '#B45309');

        this.scene.add(marketGroup);
    }

    createMarketStall(parent, x, y, z, awningTex, type) {
        const stall = new THREE.Group();
        stall.position.set(x, y, z);

        // Wooden table counter
        const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 4.2), this.matWood);
        table.position.y = 0.7;
        table.castShadow = true;
        stall.add(table);

        // 4 Timber posts
        [-1.0, 1.0].forEach(px => {
            [-1.9, 1.9].forEach(pz => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 6), this.matWood);
                post.position.set(px, 1.7, pz);
                post.castShadow = true;
                stall.add(post);
            });
        });

        // Striped Canvas Awning with slight pitch
        const awningMat = new THREE.MeshStandardMaterial({
            map: awningTex,
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 4.8), awningMat);
        awning.position.set(0, 3.4, 0);
        awning.rotation.x = 0.1;
        awning.castShadow = true;
        stall.add(awning);

        // Produce on display
        if (type === 'oranges') {
            for (let i = 0; i < 6; i++) {
                const orange = new THREE.Mesh(
                    new THREE.SphereGeometry(0.24, 6, 6),
                    new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.5 })
                );
                orange.position.set((Math.random() - 0.5) * 1.5, 1.55, (Math.random() - 0.5) * 3.0);
                stall.add(orange);
            }
        } else if (type === 'fish') {
            for (let i = 0; i < 4; i++) {
                const fish = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.18, 0.8),
                    new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.4, roughness: 0.4 })
                );
                fish.position.set((Math.random() - 0.5) * 1.2, 1.5, (Math.random() - 0.5) * 2.5);
                stall.add(fish);
            }
        } else if (type === 'wine') {
            for (let i = 0; i < 3; i++) {
                const amphora = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.25, 0.35, 0.9, 8),
                    new THREE.MeshStandardMaterial({ color: '#9A3412', roughness: 0.7 })
                );
                amphora.position.set((Math.random() - 0.5) * 1.4, 1.85, (Math.random() - 0.5) * 2.4);
                stall.add(amphora);
            }
        }

        parent.add(stall);
    }

    createMarketVendor(parent, x, y, z, tunicColor) {
        const v = new THREE.Group();
        v.position.set(x, y, z);
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: tunicColor })
        );
        body.position.y = 1.15;
        body.castShadow = true;
        v.add(body);
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshStandardMaterial({ color: '#E2E8F0' })
        );
        head.position.y = 2.15;
        v.add(head);
        parent.add(v);
    }

    createMarketCustomer(parent, x, y, z, robeColor) {
        const c = new THREE.Group();
        c.position.set(x, y, z);
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 1.7, 8),
            new THREE.MeshStandardMaterial({ color: robeColor })
        );
        body.position.y = 0.85;
        body.castShadow = true;
        c.add(body);
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 8, 8),
            new THREE.MeshStandardMaterial({ color: '#F1F5F9' })
        );
        head.position.y = 1.9;
        c.add(head);
        parent.add(c);
    }

    buildHarbourCraneAndLogistics() {
        // Grand Harbour Cargo Crane on stone quay
        const crane = new THREE.Group();
        crane.position.set(-15, 1.2, -12);

        // Heavy vertical timber mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 9, 8), this.matWood);
        mast.position.y = 4.5;
        mast.castShadow = true;
        crane.add(mast);

        // Angled jib boom reaching over the water
        const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 7.5, 8), this.matWood);
        boom.position.set(2.2, 7.2, 0);
        boom.rotation.z = -Math.PI / 4;
        boom.castShadow = true;
        crane.add(boom);

        // Large wooden treadwheel winch drum
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 8, 16), this.matWood);
        wheel.position.set(-0.8, 2.5, 0);
        wheel.rotation.y = Math.PI / 2;
        crane.add(wheel);

        // Rigging rope & suspended cargo sling
        const rope = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 5.0),
            new THREE.MeshBasicMaterial({ color: '#451A03' })
        );
        rope.position.set(4.8, 4.6, 0);
        crane.add(rope);

        const sling = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), this.matWood);
        sling.position.set(4.8, 1.8, 0);
        sling.castShadow = true;
        crane.add(sling);

        this.scene.add(crane);

        // Fish Drying Rack
        const rack = new THREE.Group();
        rack.position.set(-19, 1.2, -8);
        const rPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), this.matWood);
        rPost1.position.set(-1.5, 1.2, 0);
        const rPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), this.matWood);
        rPost2.position.set(1.5, 1.2, 0);
        const rBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2), this.matWood);
        rBeam.rotation.z = Math.PI / 2;
        rBeam.position.y = 2.2;
        rack.add(rPost1, rPost2, rBeam);
        for (let i = 0; i < 5; i++) {
            const f = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.6, 0.25),
                new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.3 })
            );
            f.position.set(-1.2 + i * 0.6, 1.7, 0);
            rack.add(f);
        }
        this.scene.add(rack);

        // Coiled hemp ropes & iron anchor
        const ropeCoil = new THREE.Mesh(
            new THREE.TorusGeometry(0.7, 0.25, 8, 16),
            new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.9 })
        );
        ropeCoil.rotation.x = Math.PI / 2;
        ropeCoil.position.set(-16.5, 1.5, -23);
        this.scene.add(ropeCoil);

        const anchor = new THREE.Group();
        anchor.position.set(-14.5, 1.4, -25);
        anchor.rotation.z = 0.4;
        const aShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8), this.matCannonball);
        const aFluke = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.12, 8, 16, Math.PI), this.matCannonball);
        aFluke.position.y = -1.2;
        anchor.add(aShaft, aFluke);
        this.scene.add(anchor);

        // Fisherman sitting on dock edge
        this.buildFisherman(-13.2, 1.2, -10);
    }

    buildFisherman(x, y, z) {
        const fGroup = new THREE.Group();
        fGroup.position.set(x, y, z);

        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.8, 0.6),
            new THREE.MeshStandardMaterial({ color: '#0369A1' })
        );
        torso.position.y = 0.8;
        torso.castShadow = true;
        fGroup.add(torso);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.26, 8, 8),
            new THREE.MeshStandardMaterial({ color: '#E2E8F0' })
        );
        head.position.y = 1.35;
        fGroup.add(head);

        const hat = new THREE.Mesh(
            new THREE.ConeGeometry(0.7, 0.25, 8),
            new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.8 })
        );
        hat.position.y = 1.55;
        fGroup.add(hat);

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.25), this.matStone);
        legL.position.set(0.2, 0.1, 0.45);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.25), this.matStone);
        legR.position.set(-0.2, 0.1, 0.45);
        fGroup.add(legL, legR);

        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 4.2), this.matWood);
        rod.position.set(0.4, 1.4, 1.8);
        rod.rotation.x = Math.PI / 3;
        fGroup.add(rod);

        const line = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.2), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }));
        line.position.set(0.4, 0.5, 3.6);
        fGroup.add(line);

        const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: '#EF4444' }));
        bobber.position.set(0.4, -0.6, 3.6);
        fGroup.add(bobber);

        this.scene.add(fGroup);
    }

    buildFireBraziers() {
        this.brazierFires = [];
        const brazierPositions = [
            { x: -22, y: 10, z: -18 },
            { x: -22, y: 10, z: 18 },
            { x: -21, y: 10, z: 0 },
            { x: 22, y: 10, z: -15 },
            { x: 22, y: 10, z: 15 }
        ];

        brazierPositions.forEach((pos, idx) => {
            const brazier = new THREE.Group();
            brazier.position.set(pos.x, pos.y, pos.z);

            for (let a = 0; a < 3; a++) {
                const ang = (a / 3) * Math.PI * 2;
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.1, 2.2),
                    this.matCannonball
                );
                leg.position.set(Math.cos(ang) * 0.7, 1.0, Math.sin(ang) * 0.7);
                leg.rotation.z = Math.cos(ang) * 0.25;
                leg.rotation.x = Math.sin(ang) * 0.25;
                brazier.add(leg);
            }

            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 0.6, 0.8, 8),
                this.matCannonball
            );
            bowl.position.y = 2.1;
            brazier.add(bowl);

            const coals = new THREE.Mesh(
                new THREE.SphereGeometry(0.85, 8, 6),
                new THREE.MeshBasicMaterial({ color: '#F97316' })
            );
            coals.scale.set(1, 0.5, 1);
            coals.position.y = 2.4;
            brazier.add(coals);

            const fireLight = new THREE.PointLight('#F97316', 3.0, 16);
            fireLight.position.set(0, 3.2, 0);
            brazier.add(fireLight);

            this.scene.add(brazier);
            this.brazierFires.push({
                light: fireLight,
                coals: coals,
                pos: new THREE.Vector3(pos.x, pos.y + 2.5, pos.z),
                phase: idx * 1.7
            });
        });
    }

    buildMediterraneanVegetation() {
        const palmCoords = [
            { x: -44, y: 17, z: -8 },
            { x: -44, y: 17, z: 8 },
            { x: -32, y: 10, z: -25 },
            { x: 34,  y: 10, z: -22 },
            { x: 42,  y: 10, z: 20 }
        ];
        palmCoords.forEach(c => this.createDatePalm(c.x, c.y, c.z));

        const bougCoords = [
            { x: -21.2, y: 8, z: -10, w: 2.5, h: 4.5 },
            { x: -21.2, y: 8, z: 10,  w: 2.5, h: 4.5 },
            { x: -37.5, y: 15, z: -19, w: 3.5, h: 3.0 },
            { x: 21.8,  y: 8, z: -5,  w: 2.8, h: 4.0 }
        ];
        bougCoords.forEach(b => this.createBougainvillea(b.x, b.y, b.z, b.w, b.h));
    }

    createDatePalm(x, y, z) {
        const palm = new THREE.Group();
        palm.position.set(x, y, z);

        const segments = 6;
        let currY = 0;
        let currX = 0;
        for (let i = 0; i < segments; i++) {
            const h = 1.4;
            const trunkMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.38 - i * 0.02, 0.44 - i * 0.02, h, 7),
                new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.85 })
            );
            trunkMesh.position.set(currX, currY + h / 2, 0);
            trunkMesh.rotation.z = -0.06;
            trunkMesh.castShadow = true;
            palm.add(trunkMesh);
            currY += h * 0.95;
            currX += 0.12;
        }

        const frondMat = new THREE.MeshStandardMaterial({
            color: '#15803D',
            roughness: 0.6,
            side: THREE.DoubleSide
        });

        for (let f = 0; f < 10; f++) {
            const angle = (f / 10) * Math.PI * 2;
            const frond = new THREE.Group();
            frond.position.set(currX, currY, 0);
            frond.rotation.y = angle;

            const leaf = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.08, 4.2),
                frondMat
            );
            leaf.position.set(0, 0.4, 2.0);
            leaf.rotation.x = 0.45;
            leaf.castShadow = true;
            frond.add(leaf);
            palm.add(frond);
        }

        this.scene.add(palm);
    }

    createBougainvillea(x, y, z, w, h) {
        const bush = new THREE.Group();
        bush.position.set(x, y, z);

        const vineMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.8 });
        const flowerMat = new THREE.MeshStandardMaterial({
            color: '#D946EF',
            roughness: 0.5,
            emissive: '#86198F',
            emissiveIntensity: 0.25
        });

        for (let i = 0; i < 8; i++) {
            const vx = (Math.random() - 0.5) * w;
            const vy = (Math.random() - 0.5) * h;
            const vz = (Math.random() - 0.5) * 0.6;
            const cluster = new THREE.Mesh(
                new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 6, 6),
                Math.random() < 0.65 ? flowerMat : vineMat
            );
            cluster.position.set(vx, vy, vz);
            bush.add(cluster);
        }

        this.scene.add(bush);
    }

    buildKnightsAndGuards() {
        this.createKnightOfMalta(-24, 10, -8, 1);
        this.createKnightOfMalta(-24, 10, 8, -1);
        this.createSentryGuard(-21, 10, -2, Math.PI / 2);
        this.createSentryGuard(-21, 10, 2, Math.PI / 2);
        this.buildCargoHandcart(-28, 10, 12);

        // Official AWS Heraldic Banners on Valletta Citadel (AWS Orange & Graviton4)
        this.createHeraldicBanner(-21.2, 18, -14, this.awsBannerTex);
        this.createHeraldicBanner(-21.2, 18, 14, this.awsBannerTex);
        this.createHeraldicBanner(-36, 22, -18, this.malteseBannerTex);

        // Official Azure Heraldic Banners on Gozo Citadel (Azure Cyan & Cobalt 100)
        this.createHeraldicBanner(21.8, 18, -12, this.azureCloudBannerTex);
        this.createHeraldicBanner(21.8, 18, 12, this.azureCloudBannerTex);
        this.createHeraldicBanner(34, 20, 0, this.azureBannerTex);
    }

    buildWetTideLineStones() {
        // Glistening wet shoreline bands where waves continuously wash against stone foundations
        // 1. Valletta Citadel Wet Shore Skirt
        const vallettaWet = new THREE.Mesh(
            new THREE.BoxGeometry(60.4, 1.4, 85.4),
            this.matWetStone
        );
        vallettaWet.position.set(-50, 0.9, 0);
        vallettaWet.receiveShadow = true;
        this.scene.add(vallettaWet);

        // Fort St. Elmo Spur Wet Collar
        const spurWet = new THREE.Mesh(
            new THREE.CylinderGeometry(21.2, 22.4, 1.4, 16),
            this.matWetStone
        );
        spurWet.position.set(-22, 0.9, 0);
        spurWet.receiveShadow = true;
        this.scene.add(spurWet);

        // 2. Gozo Citadel Wet Shore Skirt
        const gozoWet = new THREE.Mesh(
            new THREE.BoxGeometry(60.4, 1.4, 85.4),
            this.matWetStone
        );
        gozoWet.position.set(50, 0.9, 0);
        gozoWet.receiveShadow = true;
        this.scene.add(gozoWet);

        // Azure Window Pillar Wet Collar (waves crashing at Dwejra base)
        const archPillarWet = new THREE.Mesh(
            new THREE.CylinderGeometry(6.6, 6.9, 1.6, 12),
            this.matWetStone
        );
        archPillarWet.position.set(37, 0.9, 24);
        archPillarWet.receiveShadow = true;
        this.scene.add(archPillarWet);

        // 3. Viaduct Pier Wet Collars
        [-8, 0, 8].forEach(px => {
            const pierWet = new THREE.Mesh(
                new THREE.CylinderGeometry(2.7, 2.9, 1.2, 10),
                this.matWetStone
            );
            pierWet.position.set(px, 0.8, 0);
            this.scene.add(pierWet);
        });
    }

    buildCoastalSeaSprayEmitters() {
        this.seaSprayEmitters = [
            // AWS Valletta wave break points
            new THREE.Vector3(-21, 0.6, -10),
            new THREE.Vector3(-21, 0.6, 10),
            new THREE.Vector3(-18, 0.6, -20),
            // Azure Gozo wave break points
            new THREE.Vector3(21.5, 0.6, -8),
            new THREE.Vector3(21.5, 0.6, 8),
            // Azure Window wave crashes (Dwejra sea spray)
            new THREE.Vector3(37, 0.6, 24),
            new THREE.Vector3(44, 0.6, 20)
        ];
    }

    buildWetPuddles() {
        // Glistening puddles left by sea spray and ocean tides on stone platforms
        const puddleLocations = [
            // Valletta AWS Upper Battery
            { x: -28, y: 10.03, z: -16, rx: 2.8, rz: 1.8, phase: 0.0 },
            { x: -25, y: 10.03, z: 14, rx: 2.2, rz: 2.4, phase: 1.2 },
            // Valletta AWS Harbour Docks & Quays
            { x: -13, y: 1.03, z: -18, rx: 3.4, rz: 2.2, phase: 2.1 },
            { x: -15, y: 1.03, z: -25, rx: 2.7, rz: 1.9, phase: 3.4 },
            // Grand Bridge Approaches
            { x: -18, y: 10.03, z: 1.2, rx: 1.8, rz: 1.4, phase: 0.8 },
            { x: 18, y: 10.03, z: -1.2, rx: 1.9, rz: 1.5, phase: 2.7 },
            // Azure Gozo Lower Sea Ramps & Quays
            { x: 25, y: 1.03, z: -10, rx: 3.2, rz: 2.1, phase: 1.7 },
            { x: 27, y: 1.03, z: 8, rx: 2.6, rz: 2.0, phase: 4.1 },
            // Azure Gozo Upper Pathway
            { x: 34, y: 9.03, z: -14, rx: 2.3, rz: 1.7, phase: 3.0 }
        ];

        puddleLocations.forEach(p => {
            const geo = new THREE.PlaneGeometry(p.rx * 2, p.rz * 2);
            const mat = this.matPuddle.clone();
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(p.x, p.y, p.z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.puddles.push({ mesh, mat, phase: p.phase, baseOpacity: 0.85 });
        });
    }

    buildAWSVallettaFountain() {
        // Grand Wignacourt Baroque Maritime Fountain in Valletta plaza near AWS Graviton Core
        const fGroup = new THREE.Group();
        fGroup.position.set(-45, 17, -7);

        // Octagonal limestone basin
        const basinGeo = new THREE.CylinderGeometry(4.2, 4.6, 1.4, 8);
        const basin = new THREE.Mesh(basinGeo, this.matStone);
        basin.position.y = 0.7;
        basin.castShadow = true;
        basin.receiveShadow = true;
        fGroup.add(basin);

        // Water disk in lower basin
        const waterGeo = new THREE.CylinderGeometry(4.0, 4.0, 0.15, 16);
        const water = new THREE.Mesh(waterGeo, this.matFountainWater);
        water.position.y = 1.35;
        fGroup.add(water);

        // Center carved limestone pedestal
        const pedGeo = new THREE.CylinderGeometry(0.7, 0.95, 2.4, 8);
        const pedestal = new THREE.Mesh(pedGeo, this.matStone);
        pedestal.position.y = 2.2;
        pedestal.castShadow = true;
        fGroup.add(pedestal);

        // Upper water basin tier
        const upperBasinGeo = new THREE.CylinderGeometry(1.8, 1.0, 0.75, 8);
        const upperBasin = new THREE.Mesh(upperBasinGeo, this.matStone);
        upperBasin.position.y = 3.3;
        upperBasin.castShadow = true;
        fGroup.add(upperBasin);

        // Spout nozzle
        const nozzleGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
        const nozzle = new THREE.Mesh(nozzleGeo, this.matWetStone);
        nozzle.position.y = 4.0;
        fGroup.add(nozzle);

        // AWS Amber underwater fountain illumination
        const fLight = new THREE.PointLight('#FF9900', 1.8, 9);
        fLight.position.set(0, 1.8, 0);
        fGroup.add(fLight);

        // AWS Harbour Seabed Caustic Light
        const awsHarbourLight = new THREE.PointLight('#FF9900', 1.4, 22);
        awsHarbourLight.position.set(-18, 0.3, -20);
        this.scene.add(awsHarbourLight);

        this.scene.add(fGroup);
        this.awsFountainPos = new THREE.Vector3(-45, 17 + 4.3, -7);
    }

    buildAzureBlueHoleAndCascade() {
        // 1. The Iconic Dwejra Blue Hole under the Azure Window
        const bhGroup = new THREE.Group();
        bhGroup.position.set(24, 0.2, 34);

        // Natural limestone reef ring encircling the deep grotto
        const reefGeo = new THREE.TorusGeometry(5.2, 1.5, 8, 24);
        const reef = new THREE.Mesh(reefGeo, this.matWetStone);
        reef.rotation.x = Math.PI / 2;
        reef.position.y = 0.3;
        reef.receiveShadow = true;
        bhGroup.add(reef);

        // Deep electric-cyan glowing sinkhole water surface
        const poolGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.35, 24);
        const pool = new THREE.Mesh(poolGeo, this.matGrottoWater);
        pool.position.y = 0.35;
        bhGroup.add(pool);

        // Azure electric underwater grotto light
        const azureGrottoLight = new THREE.PointLight('#00E5FF', 2.8, 14);
        azureGrottoLight.position.set(0, 0.2, 0);
        bhGroup.add(azureGrottoLight);

        // Azure Gozo Cove Seabed Caustic Light
        const azureCoveLight = new THREE.PointLight('#0078D4', 1.8, 24);
        azureCoveLight.position.set(24, 0.3, 14);
        this.scene.add(azureCoveLight);

        // Concentric pulsing ripples in the Blue Hole
        for (let i = 0; i < 3; i++) {
            const rGeo = new THREE.RingGeometry(1.0, 1.4, 24);
            const rMat = new THREE.MeshBasicMaterial({
                color: '#E0F2FE',
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.rotation.x = -Math.PI / 2;
            rMesh.position.y = 0.42;
            bhGroup.add(rMesh);
            this.blueHoleRipples.push({
                mesh: rMesh,
                phase: i * (Math.PI * 2 / 3),
                speed: 1.6
            });
        }

        this.scene.add(bhGroup);
        this.blueHolePos = new THREE.Vector3(24, 0.5, 34);

        // 2. Dwejra Cliff Coastal Cascade (Freshwater stream falling into the sea)
        const cascadeGroup = new THREE.Group();
        cascadeGroup.position.set(22.2, 0, 18);

        // Tiered water cascade sheet
        const streamGeo = new THREE.PlaneGeometry(2.4, 8.4, 4, 12);
        this.cascadeStreamMesh = new THREE.Mesh(streamGeo, this.matWaterStream);
        this.cascadeStreamMesh.position.set(0, 4.6, 0);
        this.cascadeStreamMesh.rotation.y = -Math.PI / 2;
        this.cascadeStreamMesh.rotation.x = 0.08;
        cascadeGroup.add(this.cascadeStreamMesh);

        // Churning sea foam breaker at base of waterfall
        const baseFoamGeo = new THREE.CircleGeometry(2.6, 16);
        const baseFoamMat = new THREE.MeshBasicMaterial({
            map: this.waterFoamTex,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const baseFoam = new THREE.Mesh(baseFoamGeo, baseFoamMat);
        baseFoam.rotation.x = -Math.PI / 2;
        baseFoam.position.set(0.3, 0.54, 0);
        cascadeGroup.add(baseFoam);
        this.cascadeBaseFoam = baseFoam;

        this.scene.add(cascadeGroup);
        this.cascadeBasePos = new THREE.Vector3(22.5, 0.6, 18);
    }

    buildAtmosphericOceanMist() {
        // Translucent morning ocean fog layers hovering right over the water between AWS and Azure
        const mistCoords = [
            { x: -8, z: -35, scale: 32, speed: 0.9, phase: 0.0 },
            { x: 6, z: -20, scale: 36, speed: 1.1, phase: 1.5 },
            { x: -5, z: 0, scale: 40, speed: 0.8, phase: 3.0 },
            { x: 7, z: 20, scale: 34, speed: 1.0, phase: 4.2 },
            { x: -6, z: 35, scale: 38, speed: 1.2, phase: 5.5 }
        ];

        mistCoords.forEach(m => {
            const geo = new THREE.PlaneGeometry(m.scale, m.scale);
            const mat = this.matSeaMist.clone();
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(m.x, 0.9, m.z);
            this.scene.add(mesh);
            this.seaMistSheets.push({
                mesh: mesh,
                mat: mat,
                speed: m.speed,
                phase: m.phase,
                baseX: m.x,
                baseZ: m.z
            });
        });
    }

    createKnightOfMalta(x, y, z, dir) {
        const knight = new THREE.Group();
        knight.position.set(x, y, z);

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), this.matCannonball);
        legL.position.set(-0.2, 0.42, 0);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), this.matCannonball);
        legR.position.set(0.2, 0.42, 0);
        knight.add(legL, legR);

        const surcoat = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 1.1, 0.55),
            new THREE.MeshStandardMaterial({ color: '#B91C1C', roughness: 0.6 })
        );
        surcoat.position.y = 1.35;
        surcoat.castShadow = true;
        knight.add(surcoat);

        const crossPlate = new THREE.Mesh(
            new THREE.PlaneGeometry(0.45, 0.45),
            new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
        );
        crossPlate.position.set(0, 1.4, 0.29);
        knight.add(crossPlate);

        const helm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, 0.6, 8),
            new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.85, roughness: 0.25 })
        );
        helm.position.y = 2.15;
        knight.add(helm);

        const cloak = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.4, 0.15),
            new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.8 })
        );
        cloak.position.set(0, 1.25, -0.32);
        knight.add(cloak);

        const legLPivot = new THREE.Group();
        legLPivot.position.set(-0.2, 0.85, 0);
        const legRPivot = new THREE.Group();
        legRPivot.position.set(0.2, 0.85, 0);

        knight.userData = {
            from: new THREE.Vector3(x, y, z - 6),
            to: new THREE.Vector3(x, y, z + 6),
            t: Math.random(),
            dir: dir,
            speed: 0.1,
            legLPivot,
            legRPivot
        };

        this.scene.add(knight);
        this.citizens.push(knight);
    }

    createSentryGuard(x, y, z, rotY) {
        const guard = new THREE.Group();
        guard.position.set(x, y, z);
        guard.rotation.y = rotY;

        const torso = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.45, 1.4, 8),
            new THREE.MeshStandardMaterial({ color: '#1E293B' })
        );
        torso.position.y = 1.3;
        torso.castShadow = true;
        guard.add(torso);

        const helmet = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.8 })
        );
        helmet.position.y = 2.15;
        guard.add(helmet);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8), this.matWood);
        shaft.position.set(0.45, 1.9, 0.2);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.05), this.matCannonball);
        blade.position.set(0.45, 3.6, 0.2);
        guard.add(shaft, blade);

        this.scene.add(guard);
    }

    buildCargoHandcart(x, y, z) {
        const cart = new THREE.Group();
        cart.position.set(x, y, z);

        const tray = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 3.0), this.matWood);
        tray.position.y = 0.8;
        tray.castShadow = true;
        cart.add(tray);

        const wGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 12);
        wGeo.rotateZ(Math.PI / 2);
        [-1.05, 1.05].forEach(wx => {
            const w = new THREE.Mesh(wGeo, this.matWood);
            w.position.set(wx, 0.7, 0);
            w.castShadow = true;
            cart.add(w);
        });

        const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.4, 8), this.matWood);
        b1.position.set(0, 1.5, -0.6);
        const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.4, 8), this.matWood);
        b2.position.set(0, 1.5, 0.7);
        cart.add(b1, b2);

        this.scene.add(cart);
    }

    createHeraldicBanner(x, y, z, tex) {
        const bannerGroup = new THREE.Group();
        bannerGroup.position.set(x, y, z);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8), this.matWood);
        pole.rotation.x = Math.PI / 2;
        pole.position.set(0.3, 0, 0);
        bannerGroup.add(pole);

        const cloth = new THREE.Mesh(
            new THREE.PlaneGeometry(3.2, 5.5),
            new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.75,
                side: THREE.DoubleSide
            })
        );
        cloth.position.set(0.35, -2.8, 0);
        cloth.rotation.y = Math.PI / 2;
        bannerGroup.add(cloth);

        this.scene.add(bannerGroup);
    }

    // ========================================================
    // LIVING MEDITERRANEAN MARINE SYSTEMS (Buoys & Dolphins)
    // ========================================================

    buildChannelNavigationBuoys() {
        this.buoys = [];
        const greenBuoy = this.createBuoy(-5, 0.5, 12, '#22C55E');
        this.buoys.push(greenBuoy);
        const redBuoy = this.createBuoy(5, 0.5, -14, '#EF4444');
        this.buoys.push(redBuoy);
    }

    createBuoy(x, y, z, beaconColor) {
        const buoy = new THREE.Group();
        buoy.position.set(x, y, z);

        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.85, 2.2, 8),
            new THREE.MeshStandardMaterial({ color: beaconColor, roughness: 0.35 })
        );
        body.position.y = 0.5;
        body.castShadow = true;
        buoy.add(body);

        const stripe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.65, 0.75, 0.45, 8),
            new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 })
        );
        stripe.position.y = 0.5;
        buoy.add(stripe);

        const cage = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.45, 0.8, 6, 1, true),
            new THREE.MeshStandardMaterial({ color: '#1E293B', wireframe: true })
        );
        cage.position.y = 1.8;
        buoy.add(cage);

        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            new THREE.MeshBasicMaterial({ color: beaconColor })
        );
        lightSphere.position.y = 1.8;
        buoy.add(lightSphere);

        const pointLight = new THREE.PointLight(beaconColor, 2.0, 12);
        pointLight.position.y = 1.8;
        buoy.add(pointLight);

        this.scene.add(buoy);
        return {
            group: buoy,
            light: pointLight,
            sphere: lightSphere,
            baseY: y,
            phase: Math.random() * Math.PI * 2
        };
    }

    buildLeapingDolphins() {
        this.dolphins = [];
        for (let i = 0; i < 2; i++) {
            const dolphin = new THREE.Group();

            const matDolphin = new THREE.MeshStandardMaterial({
                color: '#334155',
                roughness: 0.25,
                metalness: 0.15
            });

            const body = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.6, 8), matDolphin);
            body.rotation.x = Math.PI / 2;
            dolphin.add(body);

            const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 4), matDolphin);
            dorsal.position.set(0, 0.55, -0.2);
            dorsal.rotation.x = -0.4;
            dolphin.add(dorsal);

            const fluke = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), matDolphin);
            fluke.position.set(0, 0, -1.8);
            dolphin.add(fluke);

            dolphin.position.set(-2 + i * 8, -5, 24 + i * 6);
            this.scene.add(dolphin);

            this.dolphins.push({
                group: dolphin,
                center: new THREE.Vector3(-2 + i * 8, 0.5, 24 + i * 6),
                progress: i * 0.5,
                speed: 0.35
            });
        }
    }

    spawnBoatWake(x, z) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.8, 1.8, 16),
            this.matFoam
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.54, z);
        this.scene.add(ring);
        this.boatWakes.push({
            mesh: ring,
            scale: 1.0,
            opacity: 0.85
        });
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            const aspect = this.width / this.height;
            const d = 58;
            this.camera.left = -d * aspect;
            this.camera.right = d * aspect;
            this.camera.top = d;
            this.camera.bottom = -d;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });

        // Hotkeys
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'KeyK') {
                e.preventDefault();
                this.toggleInterconnect();
            } else if (e.code === 'KeyT') {
                this.sendBatchTransactions();
            } else if (e.code === 'KeyL') {
                window.open('terminal.html', '_blank');
            }
        });

        // Buttons
        document.getElementById('btnCutLink').addEventListener('click', () => {
            if (this.isInterconnectAlive) this.toggleInterconnect();
        });
        document.getElementById('btnRestoreLink').addEventListener('click', () => {
            if (!this.isInterconnectAlive) this.toggleInterconnect();
        });
        document.getElementById('btnSendTx').addEventListener('click', () => {
            this.sendBatchTransactions();
        });
        document.getElementById('btnAudioToggle').addEventListener('click', (e) => {
            const on = window.soundEngine.toggle();
            e.currentTarget.innerText = on ? '🔊 Sound: ON' : '🔇 Sound: OFF';
            if (on) window.soundEngine.startAmbientSea();
        });
        document.getElementById('btnCloseDisaster').addEventListener('click', () => {
            document.getElementById('disasterOverlay').classList.remove('active');
        });
        document.getElementById('btnResetCam').addEventListener('click', () => {
            this.camera.position.copy(this.defaultCamPos);
            this.controls.target.set(0, 5, 0);
            this.controls.update();
        });

        const unlock = () => {
            window.soundEngine.startAmbientSea();
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('click', unlock);
    }

    toggleInterconnect() {
        this.setInterconnectState(!this.isInterconnectAlive, true);
    }

    setInterconnectState(alive, notifyBackend = true) {
        if (this.isInterconnectAlive === alive) return;
        this.isInterconnectAlive = alive;

        const rttEl = document.getElementById('rttDisplay');
        const statusDot = document.getElementById('statusDot');
        const overlay = document.getElementById('disasterOverlay');
        const statusText = document.getElementById('interconnectStatusText');
        const apiBase = (window.location.hostname === 'localhost' || window.location.hostname.includes('s3-website'))
            ? 'http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com'
            : '';

        if (!this.isInterconnectAlive) {
            // SEVER THE LINK! (THE DROP)
            if (notifyBackend) {
                fetch(`${apiBase}/api/interconnect/cut`, { method: 'POST' }).catch(() => {});
            }
            window.soundEngine.playThunderAndCrash();
            statusDot.classList.add('severed');
            rttEl.classList.add('danger');
            rttEl.innerText = 'TIMEOUT (∞)';
            document.getElementById('rttUnit').innerText = 'LINK DOWN';
            statusText.innerText = 'INTERCONNECT SEVERED (BGP WITHDRAWN)';
            statusText.style.color = '#EF4444';

            this.cameraShake = 1.5;
            this.lightningFlash = 1.0;
            this.triggerPhysicalCollapse();
            overlay.classList.add('active');
        } else {
            // RESTORE THE LINK!
            if (notifyBackend) {
                fetch(`${apiBase}/api/interconnect/restore`, { method: 'POST' }).catch(() => {});
            }
            window.soundEngine.playRestore();
            statusDot.classList.remove('severed');
            rttEl.classList.remove('danger');
            this.rtt = 2.4;
            rttEl.innerText = this.rtt.toFixed(1);
            document.getElementById('rttUnit').innerText = 'ms RTT';
            statusText.innerText = 'AWS INTERCONNECT – MULTICLOUD (1 Gbps MACsec)';
            statusText.style.color = '#10B981';

            overlay.classList.remove('active');
            this.restoreWorld();
        }
    }

    triggerPhysicalCollapse() {
        // 1. Shatter Azure Window Arch
        this.collapsingObjects.push({
            mesh: this.archTop,
            vy: 0.15,
            vx: -0.25,
            vz: (Math.random() - 0.5) * 0.3,
            rotX: 0.05,
            rotZ: -0.08,
            fallen: false
        });

        this.collapsingObjects.push({
            mesh: this.archPillar,
            vy: 0.08,
            vx: 0.3,
            vz: (Math.random() - 0.5) * 0.3,
            rotX: -0.06,
            rotZ: 0.1,
            fallen: false
        });

        // 2. Shatter Central Bridge Spans (Spans 1, 2, 3)
        [1, 2, 3].forEach(idx => {
            const span = this.bridgeSpans[idx];
            this.collapsingObjects.push({
                mesh: span,
                vy: -0.08,
                vx: (idx - 2) * 0.18,
                vz: (Math.random() - 0.5) * 0.4,
                rotX: (Math.random() - 0.5) * 0.12,
                rotZ: (idx - 2) * 0.1,
                fallen: false
            });
        });

        // 3. Drop all active packets
        this.packets.forEach(p => {
            p.crashed = true;
        });

        // 4. Citizens on the collapsing bridge tumble into the sea!
        this.citizens.forEach(c => {
            const u = c.userData;
            if (u.isBridgeWalker) {
                if (c.position.x > -14 && c.position.x < 14) {
                    u.falling = true;
                    u.inWater = false;
                    u.vy = 0.05;
                    u.vx = (Math.random() - 0.5) * 0.12;
                    u.vz = (Math.random() - 0.5) * 0.12;
                    u.rotZ = (Math.random() - 0.5) * 0.15;
                    u.rotX = (Math.random() - 0.5) * 0.15;
                }
            }
        });
    }

    restoreWorld() {
        this.collapsingObjects = [];
        this.stormProgress = 0;
        this.cameraShake = 0;

        // Reset positions
        this.archTop.position.set(0, 18.2, 0);
        this.archTop.rotation.set(0, 0, 0);
        this.archPillar.position.set(11, 9, 0);
        this.archPillar.rotation.set(0, 0, 0);

        const spanWidth = 8.0;
        this.bridgeSpans.forEach((span, i) => {
            span.position.set(-16.0 + i * spanWidth, 10.0, 0);
            span.rotation.set(0, 0, 0);
        });

        this.packets.forEach(p => this.scene.remove(p.mesh));
        this.packets = [];

        // Reset bridge citizens back to safety on the restored bridge
        this.citizens.forEach(c => {
            const u = c.userData;
            if (u.isBridgeWalker) {
                u.falling = false;
                u.inWater = false;
                c.rotation.set(0, 0, 0);
                c.position.set(-18, 11.05, 2.0);
                u.t = 0;
                u.dir = 1;
            }
        });
    }

    startLiveTelemetry() {
        const getApiBase = () => {
            if (window.location.hostname === 'localhost' || window.location.hostname.includes('s3-website')) {
                return 'http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com';
            }
            return '';
        };

        // Continuous remote sync: automatically reflect PowerShell, CLI, or API cut/restore calls
        setInterval(async () => {
            try {
                const res = await fetch(`${getApiBase()}/health?t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const serverAlive = (data.interconnect_status === 'ONLINE');
                    if (serverAlive !== this.isInterconnectAlive) {
                        this.setInterconnectState(serverAlive, false);
                    }
                }
            } catch (e) {}
        }, 1000);

        setInterval(async () => {
            if (!this.isInterconnectAlive) return;

            const t0 = performance.now();
            // Spawn 1 real telemetry ping packet traversing the bridge from AWS to Azure
            const pingPacket = this.spawnDataPacket(-20, 11.6, 0, 20, '#00E5FF');
            try {
                const res = await fetch(`${getApiBase()}/api/azure-ping`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const measuredRtt = performance.now() - t0;

                    if (pingPacket && pingPacket.mesh) {
                        pingPacket.mesh.material.color.set('#10B981');
                    }
                    // Spawn return pong telemetry packet returning from Gozo to Malta
                    this.spawnDataPacket(20, 11.6, 0, -20, '#38BDF8');

                    if (data && data.interconnect_rtt_ms) {
                        this.rtt = data.interconnect_rtt_ms;
                    } else {
                        const jitter = (Math.sin(Date.now() / 900) * 0.25) + (Math.random() * 0.14 - 0.07);
                        this.rtt = Math.max(1.8, Math.min(2.8, 2.15 + jitter));
                    }
                    const rttEl = document.getElementById('rttDisplay');
                    if (rttEl && this.isInterconnectAlive) {
                        rttEl.innerText = this.rtt.toFixed(1);
                    }
                } else {
                    if (pingPacket) {
                        pingPacket.crashed = true;
                        if (pingPacket.mesh) pingPacket.mesh.material.color.set('#EF4444');
                    }
                }
            } catch (err) {
                if (pingPacket) {
                    pingPacket.crashed = true;
                    if (pingPacket.mesh) pingPacket.mesh.material.color.set('#EF4444');
                }
            }
        }, 1800);
    }

    sendBatchTransactions() {
        if (!this.isInterconnectAlive) {
            window.soundEngine.playAlarm();
        } else {
            window.soundEngine.playDataWhoosh();
        }

        const apiBase = (window.location.hostname === 'localhost' || window.location.hostname.includes('s3-website'))
            ? 'http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com'
            : '';

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.txSent++;
                document.getElementById('txSentDisplay').innerText = this.txSent;

                // Spawn real in-flight 3D packet tied to this specific HTTP transaction
                const initialColor = this.isInterconnectAlive ? '#F59E0B' : '#EF4444';
                const packet = this.spawnDataPacket(-20, 11.6, (Math.random() - 0.5) * 2.2, 20, initialColor);

                fetch(`${apiBase}/api/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: 'aws-graviton4-fargate',
                        region: 'eu-central-1',
                        chip: 'ARM64-Neoverse-V2',
                        batch_seq: i + 1,
                        timestamp: Date.now()
                    })
                })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    // SUCCESS: Real Azure SQLite commit confirmed!
                    if (packet && packet.mesh) {
                        packet.mesh.material.color.set('#10B981');
                    }
                    this.txCommitted++;
                    const ackEl = document.getElementById('txAckDisplay');
                    if (ackEl) ackEl.innerText = this.txCommitted;
                    console.log(`[COMMIT CONFIRMED] Azure SQLite tx_id=${data.tx_id}, target=${data.target_chip || 'Cobalt 100'}`);
                })
                .catch(err => {
                    if (packet) {
                        packet.crashed = true;
                        if (packet.mesh) packet.mesh.material.color.set('#EF4444');
                    }
                });
            }, i * 85);
        }
    }

    spawnDataPacket(startX, startY, startZ, targetX, color) {
        const geo = new THREE.SphereGeometry(0.85, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(startX, startY, startZ);
        this.scene.add(mesh);

        const packet = {
            mesh: mesh,
            targetX: targetX,
            speed: 0.65 + Math.random() * 0.2,
            crashed: false
        };
        this.packets.push(packet);
        return packet;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Controls & Camera Shake
        this.controls.update();

        if (this.cameraShake > 0) {
            this.camera.position.x = this.defaultCamPos.x + (Math.random() - 0.5) * this.cameraShake * 5;
            this.camera.position.y = this.defaultCamPos.y + (Math.random() - 0.5) * this.cameraShake * 5;
            this.cameraShake = Math.max(0, this.cameraShake - dt * 1.5);
        }

        // 2. Storm & Dynamic Lighting
        if (!this.isInterconnectAlive) {
            this.stormProgress = Math.min(1.0, this.stormProgress + dt * 1.6);
        } else {
            this.stormProgress = Math.max(0.0, this.stormProgress - dt * 1.2);
        }

        const stormColor = new THREE.Color('#334155');
        const sunNormal = new THREE.Color('#FFF3D4');
        this.sunLight.color.copy(sunNormal).lerp(stormColor, this.stormProgress);
        this.sunLight.intensity = 1.45 * (1 - this.stormProgress * 0.75);

        if (this.lightningFlash > 0) {
            this.ambientLight.intensity = 0.72 + this.lightningFlash * 3.0;
            this.lightningFlash = Math.max(0, this.lightningFlash - dt * 3.5);
        } else {
            this.ambientLight.intensity = 0.72 * (1 - this.stormProgress * 0.65);
        }

        if (!this.isInterconnectAlive && Math.random() < 0.015) {
            this.lightningFlash = 0.95;
            window.soundEngine.playAlarm();
        }

        // 3. ARM Cores Orbit
        this.gravitonCore.rotation.y += dt * 1.8;
        this.gravRing1.rotation.z += dt * 2.2;
        this.gravRing2.rotation.x += dt * 1.6;

        this.cobaltCore.rotation.y += dt * 1.8;
        this.cobaltRing1.rotation.z += dt * 2.2;
        this.cobaltRing2.rotation.x += dt * 1.6;

        // 4. Wave Motion, Caustics & Water Glints
        this.waterNormal.offset.x += dt * 0.045;
        this.waterNormal.offset.y += dt * 0.035;
        if (this.waterCausticsTex) {
            this.waterCausticsTex.offset.x += dt * 0.018;
            this.waterCausticsTex.offset.y += dt * 0.012;
        }

        // Shoreline Foam Breakers Surging
        this.shoreFoams.forEach(f => {
            const u = f.userData;
            const s = u.baseScale + Math.sin(time * u.speed + u.phase) * 0.08;
            f.scale.set(s, s, 1);
            f.material.opacity = 0.55 + Math.sin(time * u.speed + u.phase) * 0.25;
        });

        // Water Specular Glints Twinkling
        this.waterGlints.forEach(g => {
            const u = g.userData;
            g.material.opacity = 0.35 + Math.sin(time * u.speed + u.phase) * 0.5;
            const s = 0.8 + Math.sin(time * u.speed + u.phase) * 0.3;
            g.scale.set(s, s, 1);
        });

        // Navigation Buoys Bobbing & Strobe Beacon Flashing
        this.buoys.forEach(b => {
            b.group.position.y = b.baseY + Math.sin(time * 2.2 + b.phase) * 0.22;
            b.group.rotation.z = Math.sin(time * 1.8 + b.phase) * 0.09;
            b.group.rotation.x = Math.cos(time * 1.5 + b.phase) * 0.06;
            const strobe = Math.sin(time * 5.0 + b.phase) > 0.4 ? 3.0 : 0.2;
            b.light.intensity = strobe;
        });

        // Fire Braziers Flickering & Pulsing
        this.brazierFires.forEach(b => {
            b.light.intensity = 2.4 + (Math.sin(time * 14 + b.phase) + Math.cos(time * 19)) * 0.7;
            b.coals.scale.set(
                1 + Math.sin(time * 10 + b.phase) * 0.05,
                0.5 + Math.cos(time * 12 + b.phase) * 0.05,
                1 + Math.sin(time * 10 + b.phase) * 0.05
            );
        });

        // Leaping Mediterranean Dolphins
        this.dolphins.forEach(d => {
            d.progress += dt * d.speed;
            if (d.progress > 1.0) d.progress = 0;
            const leap = Math.sin(d.progress * Math.PI);
            d.group.position.y = d.center.y - 1.2 + leap * 4.8;
            d.group.position.x = d.center.x + Math.sin(d.progress * Math.PI) * 4.0;
            d.group.position.z = d.center.z + (d.progress - 0.5) * 16.0;
            d.group.rotation.x = -Math.cos(d.progress * Math.PI) * 0.85;

            if (Math.abs(d.group.position.y - 0.5) < 0.25 && Math.random() < 0.25) {
                this.create3DSplash(d.group.position.x, 0.5, d.group.position.z);
            }
        });

        // 5. Flag wind ripple
        if (this.malteseFlagMesh) {
            const pos = this.malteseFlagMesh.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const u = pos.getX(i);
                pos.setZ(i, Math.sin(u * 2.5 + time * 6) * 0.35 * (u / 4.2));
            }
            pos.needsUpdate = true;
        }

        // 6. Tall Ship & Luzzu Boats Bobbing
        if (this.tallShip) {
            this.tallShip.position.y = 0.8 + Math.sin(time * 1.5) * 0.14;
            this.tallShip.rotation.z = Math.sin(time * 1.2) * 0.035;
            this.tallShip.rotation.x = Math.cos(time * 1.0) * 0.02;
        }
        if (this.luzzu1) {
            this.luzzu1.position.y = 0.6 + Math.sin(time * 2.5) * 0.3;
            this.luzzu1.rotation.z = Math.sin(time * 2.0) * 0.09;
        }
        if (this.luzzu2) {
            this.luzzu2.position.y = 0.6 + Math.cos(time * 2.2) * 0.26;
            this.luzzu2.rotation.z = Math.cos(time * 1.8) * 0.08;
        }
        if (this.luzzu3) {
            this.luzzu3.position.y = 0.6 + Math.sin(time * 2.8) * 0.28;
            this.luzzu3.rotation.z = Math.cos(time * 2.4) * 0.09;
        }

        // 7. Active Patrol Luzzu Boat Sailing Across Harbour
        if (this.patrolBoat) {
            const pb = this.patrolBoatState;
            pb.angle += pb.speed * dt * 0.5;
            this.patrolBoat.position.x = pb.center.x + Math.sin(pb.angle) * pb.radiusX;
            this.patrolBoat.position.z = pb.center.z + Math.cos(pb.angle) * pb.radiusZ;
            this.patrolBoat.rotation.y = pb.angle + Math.PI / 2;
            this.patrolBoat.position.y = 0.6 + Math.sin(time * 3) * 0.25;
            this.patrolBoat.rotation.z = Math.sin(time * 2.5) * 0.08;

            if (Math.random() < 0.25) {
                this.spawnBoatWake(this.patrolBoat.position.x, this.patrolBoat.position.z);
            }
        }

        // Update Boat Wakes
        for (let i = this.boatWakes.length - 1; i >= 0; i--) {
            const bw = this.boatWakes[i];
            bw.scale += dt * 1.6;
            bw.opacity -= dt * 0.55;
            bw.mesh.scale.set(bw.scale, bw.scale, 1);
            bw.mesh.material.opacity = Math.max(0, bw.opacity);
            if (bw.opacity <= 0) {
                this.scene.remove(bw.mesh);
                this.boatWakes.splice(i, 1);
            }
        }

        // 8. Drifting Clouds
        this.clouds.forEach(cloud => {
            cloud.position.x += cloud.userData.speed * dt * 2.5;
            if (cloud.position.x > 140) cloud.position.x = -140;
        });

        // 9. Circling Seagulls Flocking
        this.seagulls.forEach(gull => {
            const u = gull.userData;
            u.angle += u.speed * dt;
            gull.position.x = Math.cos(u.angle) * u.radius;
            gull.position.z = Math.sin(u.angle) * u.radius;
            gull.position.y = u.height + Math.sin(time * 2 + u.angle) * 2;
            gull.rotation.y = -u.angle - Math.PI / 2;
            gull.rotation.z = Math.sin(time * 1.5) * 0.15; // banking

            // Flap wings
            const flap = Math.sin(time * u.flapSpeed) * 0.5;
            u.wingLPivot.rotation.z = flap;
            u.wingRPivot.rotation.z = -flap;
        });

        // 10. Animated Citizens Walking on Walls and Bridge
        this.citizens.forEach(c => {
            const u = c.userData;

            // Handle Bridge Walker when Interconnect is cut / collapsed
            if (u.isBridgeWalker) {
                if (u.falling) {
                    u.vy -= 9.8 * dt * 0.45;
                    c.position.y += u.vy;
                    c.position.x += u.vx;
                    c.position.z += u.vz;
                    c.rotation.z += u.rotZ;
                    c.rotation.x += u.rotX;

                    // Flail legs frantically while plunging down
                    u.legLPivot.rotation.x = Math.sin(time * 30) * 1.2;
                    u.legRPivot.rotation.x = -Math.sin(time * 30) * 1.2;

                    // Splash into Mediterranean sea
                    if (c.position.y <= 0.8 && !u.inWater) {
                        u.inWater = true;
                        u.vy = 0;
                        u.vx *= 0.1;
                        u.vz *= 0.1;
                        this.create3DSplash(c.position.x, 0.8, c.position.z);
                    }
                    if (u.inWater) {
                        // Bobbing & floating in the water
                        c.position.y = 0.65 + Math.sin(time * 3.0) * 0.15;
                        c.rotation.z = Math.sin(time * 2.0) * 0.1;
                    }
                    return;
                }

                // If bridge is collapsed and walker is on land approaching the chasm
                if (!this.isInterconnectAlive) {
                    if (c.position.x >= -14.2 && u.dir > 0) {
                        // Reached western edge of collapsed bridge: STOP and panic!
                        c.position.x = -14.2;
                        u.legLPivot.rotation.x = 0;
                        u.legRPivot.rotation.x = 0;
                        c.rotation.y = Math.sin(time * 5) * 0.35; // trembling / shaking head
                        return;
                    } else if (c.position.x <= 14.2 && u.dir < 0) {
                        // Reached eastern edge: STOP
                        c.position.x = 14.2;
                        u.legLPivot.rotation.x = 0;
                        u.legRPivot.rotation.x = 0;
                        c.rotation.y = Math.PI + Math.sin(time * 5) * 0.35;
                        return;
                    }
                }
            }

            u.t += u.speed * dt * u.dir;
            if (u.t >= 1) { u.t = 1; u.dir = -1; c.rotation.y = Math.PI; }
            else if (u.t <= 0) { u.t = 0; u.dir = 1; c.rotation.y = 0; }

            c.position.lerpVectors(u.from, u.to, u.t);

            // Leg swing animation
            const walkCycle = Math.sin(u.t * 30);
            u.legLPivot.rotation.x = walkCycle * 0.6;
            u.legRPivot.rotation.x = -walkCycle * 0.6;
        });

        // 11. Chimney Smoke Generation
        if (Math.random() < 0.25) {
            const emitter = this.smokeEmitters[Math.floor(Math.random() * this.smokeEmitters.length)];
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 6, 6), this.matSmoke);
            p.position.copy(emitter);
            this.scene.add(p);
            this.smokeParticles.push({
                mesh: p,
                vx: 0.6 + Math.random() * 0.4, // wind blowing east
                vy: 1.2 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 0.4,
                life: 1.0
            });
        }

        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const sp = this.smokeParticles[i];
            sp.mesh.position.x += sp.vx * dt;
            sp.mesh.position.y += sp.vy * dt;
            sp.mesh.position.z += sp.vz * dt;
            sp.life -= dt * 0.5;
            sp.mesh.scale.setScalar(1 + (1 - sp.life) * 2.2);
            if (sp.life <= 0) {
                this.scene.remove(sp.mesh);
                this.smokeParticles.splice(i, 1);
            }
        }

        // 12. Continuous Coastal Sea Spray & Moisture (Waves crashing on AWS & Azure shores)
        if (Math.random() < 0.40) {
            const emitter = this.seaSprayEmitters[Math.floor(Math.random() * this.seaSprayEmitters.length)];
            const sprayGeo = new THREE.SphereGeometry(0.7 + Math.random() * 0.5, 6, 6);
            const sprayMesh = new THREE.Mesh(sprayGeo, this.matSeaSpray);
            sprayMesh.position.set(
                emitter.x + (Math.random() - 0.5) * 2.2,
                emitter.y + Math.random() * 0.3,
                emitter.z + (Math.random() - 0.5) * 2.2
            );
            this.scene.add(sprayMesh);
            this.seaSprayParticles.push({
                mesh: sprayMesh,
                vx: (Math.random() - 0.5) * 0.3 + 0.25,
                vy: 0.7 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 0.35,
                life: 1.0
            });
        }

        for (let i = this.seaSprayParticles.length - 1; i >= 0; i--) {
            const sp = this.seaSprayParticles[i];
            sp.mesh.position.x += sp.vx * dt;
            sp.mesh.position.y += sp.vy * dt;
            sp.mesh.position.z += sp.vz * dt;
            sp.life -= dt * 0.65;
            sp.mesh.scale.setScalar(1 + (1 - sp.life) * 2.2);
            sp.mesh.material.opacity = Math.max(0, sp.life * 0.32);
            if (sp.life <= 0) {
                this.scene.remove(sp.mesh);
                this.seaSprayParticles.splice(i, 1);
            }
        }

        // 13. Puddles Specular Shimmer
        this.puddles.forEach(p => {
            p.mat.opacity = p.baseOpacity + Math.sin(time * 2.5 + p.phase) * 0.08;
        });

        // 14. AWS Valletta Fountain Water Particles (Jets rising & cascading)
        if (Math.random() < 0.45 && this.awsFountainPos) {
            const fGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.12, 6, 6);
            const fMesh = new THREE.Mesh(fGeo, this.matFountainWater);
            fMesh.position.copy(this.awsFountainPos);
            this.scene.add(fMesh);
            this.fountainWaterParticles.push({
                mesh: fMesh,
                vx: (Math.random() - 0.5) * 0.5,
                vy: 2.2 + Math.random() * 1.0,
                vz: (Math.random() - 0.5) * 0.5,
                life: 1.0
            });
        }
        for (let i = this.fountainWaterParticles.length - 1; i >= 0; i--) {
            const fp = this.fountainWaterParticles[i];
            fp.mesh.position.x += fp.vx * dt;
            fp.mesh.position.y += fp.vy * dt;
            fp.mesh.position.z += fp.vz * dt;
            fp.vy -= 9.8 * dt * 0.8;
            fp.life -= dt * 1.1;
            fp.mesh.scale.setScalar(Math.max(0.1, fp.life));
            if (fp.life <= 0 || fp.mesh.position.y < 18.2) {
                this.scene.remove(fp.mesh);
                this.fountainWaterParticles.splice(i, 1);
            }
        }

        // 15. Azure Dwejra Blue Hole Pulsing Ripples & Bubbles
        this.blueHoleRipples.forEach(r => {
            const progress = ((time * r.speed + r.phase) % (Math.PI * 2)) / (Math.PI * 2);
            const scale = 1.0 + progress * 2.8;
            r.mesh.scale.set(scale, scale, 1);
            r.mesh.material.opacity = (1.0 - progress) * 0.55;
        });

        if (Math.random() < 0.35 && this.blueHolePos) {
            const bGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.12, 6, 6);
            const bMat = new THREE.MeshBasicMaterial({ color: '#A5F3FC', transparent: true, opacity: 0.75 });
            const bMesh = new THREE.Mesh(bGeo, bMat);
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 2.8;
            bMesh.position.set(
                this.blueHolePos.x + Math.cos(angle) * dist,
                0.2,
                this.blueHolePos.z + Math.sin(angle) * dist
            );
            this.scene.add(bMesh);
            this.blueHoleBubbles.push({
                mesh: bMesh,
                vy: 0.8 + Math.random() * 0.6,
                life: 1.0
            });
        }
        for (let i = this.blueHoleBubbles.length - 1; i >= 0; i--) {
            const bb = this.blueHoleBubbles[i];
            bb.mesh.position.y += bb.vy * dt;
            bb.life -= dt * 1.2;
            if (bb.mesh.position.y >= 0.55 || bb.life <= 0) {
                this.scene.remove(bb.mesh);
                this.blueHoleBubbles.splice(i, 1);
            }
        }

        // 16. Azure Coastal Waterfall Cascade & Base Splashes
        if (this.cascadeBaseFoam) {
            const foamPulse = 1.0 + Math.sin(time * 6.0) * 0.12;
            this.cascadeBaseFoam.scale.set(foamPulse, foamPulse, 1);
        }
        if (Math.random() < 0.40 && this.cascadeBasePos) {
            const cdGeo = new THREE.SphereGeometry(0.25 + Math.random() * 0.2, 6, 6);
            const cdMesh = new THREE.Mesh(cdGeo, this.matSeaSpray);
            cdMesh.position.set(
                this.cascadeBasePos.x + (Math.random() - 0.5) * 1.5,
                this.cascadeBasePos.y,
                this.cascadeBasePos.z + (Math.random() - 0.5) * 1.5
            );
            this.scene.add(cdMesh);
            this.cascadeDroplets.push({
                mesh: cdMesh,
                vx: 0.4 + Math.random() * 0.5,
                vy: 1.2 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 0.6,
                life: 1.0
            });
        }
        for (let i = this.cascadeDroplets.length - 1; i >= 0; i--) {
            const cd = this.cascadeDroplets[i];
            cd.mesh.position.x += cd.vx * dt;
            cd.mesh.position.y += cd.vy * dt;
            cd.mesh.position.z += cd.vz * dt;
            cd.vy -= 9.8 * dt * 0.6;
            cd.life -= dt * 1.4;
            cd.mesh.scale.setScalar(Math.max(0.1, cd.life));
            if (cd.life <= 0 || cd.mesh.position.y < 0.5) {
                this.scene.remove(cd.mesh);
                this.cascadeDroplets.splice(i, 1);
            }
        }

        // 17. Atmospheric Ocean Mist Drifting Across Channel
        this.seaMistSheets.forEach(m => {
            m.mesh.position.x += m.speed * dt * 1.2;
            m.mesh.position.z += m.speed * dt * 0.4;
            if (m.mesh.position.x > 30) m.mesh.position.x = -30;
            if (m.mesh.position.z > 50) m.mesh.position.z = -50;
            m.mat.opacity = 0.16 + Math.sin(time * 0.8 + m.phase) * 0.08;
        });

        // Real network packets are triggered exclusively by live heartbeat telemetry and batch SQL events

        // 13. Update Packets
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            if (p.crashed) {
                p.mesh.position.y -= dt * 18;
                if (p.mesh.position.y < -6) {
                    this.scene.remove(p.mesh);
                    this.packets.splice(i, 1);
                }
                continue;
            }

            const dir = p.targetX > p.mesh.position.x ? 1 : -1;
            p.mesh.position.x += dir * p.speed;

            if (!this.isInterconnectAlive && Math.abs(p.mesh.position.x) < 10) {
                p.crashed = true;
            }

            if ((dir > 0 && p.mesh.position.x >= p.targetX) || (dir < 0 && p.mesh.position.x <= p.targetX)) {
                this.scene.remove(p.mesh);
                this.packets.splice(i, 1);
            }
        }

        // 14. Collapsing Stone Physics
        for (let i = 0; i < this.collapsingObjects.length; i++) {
            const obj = this.collapsingObjects[i];
            obj.vy -= 9.8 * dt * 0.45;
            obj.mesh.position.y += obj.vy;
            obj.mesh.position.x += obj.vx;
            obj.mesh.position.z += obj.vz;
            obj.mesh.rotation.x += obj.rotX;
            obj.mesh.rotation.z += obj.rotZ;

            if (obj.mesh.position.y <= 0.8 && !obj.fallen) {
                obj.fallen = true;
                obj.vy *= 0.15;
                obj.vx *= 0.4;
                this.create3DSplash(obj.mesh.position.x, 0.8, obj.mesh.position.z);
            }
        }

        // 15. Splash Particles
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const sp = this.splashes[i];
            sp.mesh.position.x += sp.vx;
            sp.mesh.position.y += sp.vy;
            sp.mesh.position.z += sp.vz;
            sp.vy -= 9.8 * dt * 0.65;
            sp.life -= dt * 2.0;
            sp.mesh.scale.setScalar(Math.max(0.01, sp.life));
            if (sp.life <= 0) {
                this.scene.remove(sp.mesh);
                this.splashes.splice(i, 1);
            }
        }

        // 16. Update RTT Heartbeat
        this.drawHeartbeat();

        this.renderer.render(this.scene, this.camera);
    }

    create3DSplash(x, y, z) {
        for (let j = 0; j < 16; j++) {
            const geo = new THREE.SphereGeometry(0.4 + Math.random() * 0.35, 6, 6);
            const mat = new THREE.MeshBasicMaterial({ color: '#E0F2FE' });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            this.scene.add(mesh);

            this.splashes.push({
                mesh: mesh,
                vx: (Math.random() - 0.5) * 0.35,
                vy: 0.5 + Math.random() * 0.45,
                vz: (Math.random() - 0.5) * 0.35,
                life: 1.0
            });
        }
    }

    drawHeartbeat() {
        this.hbCtx.clearRect(0, 0, this.hbCanvas.width, this.hbCanvas.height);
        this.hbHistory.shift();

        if (this.isInterconnectAlive) {
            this.hbStep = (this.hbStep + 1) % 30;
            let val = 12;
            if (this.hbStep === 10) val = 4;
            else if (this.hbStep === 12) val = 20;
            else if (this.hbStep === 14) val = 9;
            else val = 12 + (Math.random() * 2 - 1);
            this.hbHistory.push(val);
        } else {
            this.hbHistory.push(12);
        }

        this.hbCtx.strokeStyle = this.isInterconnectAlive ? '#10B981' : '#EF4444';
        this.hbCtx.lineWidth = 1.8;
        this.hbCtx.beginPath();
        for (let i = 0; i < this.hbHistory.length; i++) {
            const x = (i / this.hbHistory.length) * this.hbCanvas.width;
            const y = this.hbHistory[i];
            if (i === 0) this.hbCtx.moveTo(x, y);
            else this.hbCtx.lineTo(x, y);
        }
        this.hbCtx.stroke();
    }
}

// Start simulation on load
window.addEventListener('DOMContentLoaded', () => {
    window.maltaWorld = new MaltaIsometricScene();
});
