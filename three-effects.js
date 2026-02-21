// ─── FLEETFLOW · THREE.JS EFFECTS ─────────────────────────────────────────────

// ── Login Particle Network ────────────────────────────────────────────────────
let _loginRenderer = null, _loginAnim = null;

function destroyLoginScene() {
    if (_loginAnim) { cancelAnimationFrame(_loginAnim); _loginAnim = null; }
    if (_loginRenderer) { _loginRenderer.dispose(); _loginRenderer = null; }
}

function initLoginScene() {
    if (!window.THREE) return;
    const canvas = document.getElementById('login-canvas');
    if (!canvas) return;
    destroyLoginScene();

    const W = window.innerWidth, H = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 110;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _loginRenderer = renderer;

    // ── Particles ──────────────────────────────────────────────────────────────
    const N = 160;
    const positions = new Float32Array(N * 3);
    const velocities = [];

    for (let i = 0; i < N; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 220;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        velocities.push({
            x: (Math.random() - 0.5) * 0.12,
            y: (Math.random() - 0.5) * 0.12,
        });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xF59E0B, size: 1.8, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(pGeo, pMat));

    // ── Connecting Lines ───────────────────────────────────────────────────────
    const maxSegs = N * N;
    const linePos = new Float32Array(maxSegs * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lMat = new THREE.LineBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.13 });
    scene.add(new THREE.LineSegments(lGeo, lMat));

    // ── Mouse parallax ─────────────────────────────────────────────────────────
    let mx = 0, my = 0;
    const _onMouse = e => { mx = (e.clientX / W - 0.5) * 18; my = -(e.clientY / H - 0.5) * 10; };
    window.addEventListener('mousemove', _onMouse);

    // ── Animate ────────────────────────────────────────────────────────────────
    const animate = () => {
        if (!_loginRenderer) return;
        _loginAnim = requestAnimationFrame(animate);
        const pos = pGeo.attributes.position.array;

        for (let i = 0; i < N; i++) {
            pos[i * 3] += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            if (pos[i * 3] > 110 || pos[i * 3] < -110) velocities[i].x *= -1;
            if (pos[i * 3 + 1] > 65 || pos[i * 3 + 1] < -65) velocities[i].y *= -1;
        }
        pGeo.attributes.position.needsUpdate = true;

        let idx = 0;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                if (dx * dx + dy * dy < 700) {
                    linePos[idx++] = pos[i * 3]; linePos[idx++] = pos[i * 3 + 1]; linePos[idx++] = pos[i * 3 + 2];
                    linePos[idx++] = pos[j * 3]; linePos[idx++] = pos[j * 3 + 1]; linePos[idx++] = pos[j * 3 + 2];
                }
            }
        }
        lGeo.setDrawRange(0, idx / 3);
        lGeo.attributes.position.needsUpdate = true;

        camera.position.x += (mx - camera.position.x) * 0.04;
        camera.position.y += (my - camera.position.y) * 0.04;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    };
    animate();

    const _onResize = () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (_loginRenderer) _loginRenderer.setSize(w, h);
    };
    window.addEventListener('resize', _onResize);
}

// ── 3D Globe Scene ────────────────────────────────────────────────────────────
let _globeRenderer = null, _globeAnim = null;

function destroyGlobeScene() {
    if (_globeAnim) { cancelAnimationFrame(_globeAnim); _globeAnim = null; }
    if (_globeRenderer) { _globeRenderer.dispose(); _globeRenderer = null; }
}

function initGlobeScene() {
    if (!window.THREE) return;
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;
    destroyGlobeScene();

    const W = canvas.offsetWidth || 400;
    const H = canvas.offsetHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.z = 3.0;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _globeRenderer = renderer;

    // ── Globe Group (everything rotates together) ──────────────────────────────
    const group = new THREE.Group();
    scene.add(group);

    // Core sphere
    const sphereMat = new THREE.MeshPhongMaterial({
        color: 0x0a0e1a,
        emissive: 0x0d1830,
        shininess: 8,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1, 52, 52), sphereMat));

    // Lat/lon wireframe grid
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x1a2040, wireframe: true, transparent: true, opacity: 0.45 });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1.008, 22, 22), gridMat));

    // Outer atmosphere (glow ring — doesn't rotate)
    const atmoMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.05, side: THREE.BackSide });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), atmoMat));

    // ── Lights ─────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x223355, 1.4));
    const sun = new THREE.DirectionalLight(0xfff0dd, 1.6);
    sun.position.set(4, 2, 5);
    scene.add(sun);
    const rimLight = new THREE.DirectionalLight(0x3B82F6, 0.5);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // ── Vehicle Location Pins ──────────────────────────────────────────────────
    const vehicleLocations = [
        { lat: 41.88, lon: -87.63, status: 'Active', label: 'Iron Rhino' },
        { lat: 34.05, lon: -118.25, status: 'On Trip', label: 'Blaze Runner' },
        { lat: 32.78, lon: -96.80, status: 'Active', label: 'Swift Cargo' },
        { lat: 40.71, lon: -74.00, status: 'In Shop', label: 'Night Owl' },
        { lat: 29.76, lon: -95.37, status: 'Active', label: 'Delta Express' },
        { lat: 47.61, lon: -122.33, status: 'Idle', label: 'Quicksilver' },
        { lat: 25.77, lon: -80.19, status: 'On Trip', label: 'Storm Hauler' },
        { lat: 33.75, lon: -84.39, status: 'Suspended', label: 'Falcon Van' },
    ];
    const statusColor = {
        'Active': 0x22C55E, 'On Trip': 0xF59E0B,
        'In Shop': 0xEF4444, 'Idle': 0x6B7280, 'Suspended': 0xEF4444,
    };

    vehicleLocations.forEach(loc => {
        const phi = (90 - loc.lat) * (Math.PI / 180);
        const theta = (loc.lon + 180) * (Math.PI / 180);
        const R = 1.025;
        const x = -(Math.sin(phi) * Math.cos(theta)) * R;
        const y = Math.cos(phi) * R;
        const z = Math.sin(phi) * Math.sin(theta) * R;
        const col = statusColor[loc.status] || 0xF59E0B;

        // Solid dot
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.026, 10, 10),
            new THREE.MeshBasicMaterial({ color: col })
        );
        dot.position.set(x, y, z);
        group.add(dot);

        // Pulse ring
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.034, 0.054, 18),
            new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
        );
        ring.position.set(x, y, z);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        group.add(ring);
    });

    // ── Drag to Rotate ─────────────────────────────────────────────────────────
    let drag = false, lastX = 0, lastY = 0;
    canvas.style.cursor = 'grab';

    const _md = e => { drag = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = 'grabbing'; };
    const _mu = () => { drag = false; canvas.style.cursor = 'grab'; };
    const _mm = e => {
        if (!drag) return;
        group.rotation.y += (e.clientX - lastX) * 0.005;
        group.rotation.x += (e.clientY - lastY) * 0.003;
        lastX = e.clientX; lastY = e.clientY;
    };
    canvas.addEventListener('mousedown', _md);
    window.addEventListener('mouseup', _mu);
    window.addEventListener('mousemove', _mm);

    // ── Animate ────────────────────────────────────────────────────────────────
    let frame = 0;
    const animate = () => {
        if (!_globeRenderer) return;
        _globeAnim = requestAnimationFrame(animate);
        if (!drag) group.rotation.y += 0.0025;
        // Pulse rings
        frame++;
        group.children.forEach((child, i) => {
            if (child.geometry && child.geometry.type === 'RingGeometry') {
                child.material.opacity = 0.3 + 0.3 * Math.sin(frame * 0.05 + i);
            }
        });
        renderer.render(scene, camera);
    };
    animate();

    const _onResize = () => {
        if (!canvas.isConnected) return;
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (_globeRenderer) _globeRenderer.setSize(w, h);
    };
    window.addEventListener('resize', _onResize);
}
