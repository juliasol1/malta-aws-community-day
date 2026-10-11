// High-Fidelity Procedural Textures for Maltese Isometric World
// Inspired by Age of Empires III & Anno 1800 aesthetic

class TextureGenerator {
    static createLimestoneTexture() {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 1024;
        const ctx = c.getContext('2d');

        // Warm Globigerina limestone gradient base
        const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
        bgGrad.addColorStop(0, '#E5BA6A');
        bgGrad.addColorStop(0.5, '#DDAE5B');
        bgGrad.addColorStop(1, '#CE9C4A');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Ashlar masonry blocks pattern
        const blockW = 128;
        const blockH = 64;

        for (let y = 0; y < 1024; y += blockH) {
            const shift = (Math.floor(y / blockH) % 2) * (blockW / 2);
            for (let x = -blockW; x < 1024 + blockW; x += blockW) {
                // Subtle hue & luminance shift per stone block
                const shade = (Math.random() - 0.5) * 36;
                const r = Math.min(255, Math.max(0, 225 + shade));
                const g = Math.min(255, Math.max(0, 178 + shade * 0.85));
                const b = Math.min(255, Math.max(0, 95 + shade * 0.5));
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x + shift + 2, y + 2, blockW - 4, blockH - 4);

                // Top & left bevel highlight
                ctx.fillStyle = 'rgba(255, 245, 220, 0.28)';
                ctx.fillRect(x + shift + 2, y + 2, blockW - 4, 3);
                ctx.fillRect(x + shift + 2, y + 2, 3, blockH - 4);

                // Bottom & right shadow groove
                ctx.fillStyle = 'rgba(90, 60, 20, 0.45)';
                ctx.fillRect(x + shift + 2, y + blockH - 3, blockW - 4, 3);
                ctx.fillRect(x + shift + blockW - 3, y + 2, 3, blockH - 4);

                // Weathering streaks
                if (Math.random() < 0.3) {
                    ctx.fillStyle = 'rgba(110, 80, 40, 0.15)';
                    ctx.fillRect(x + shift + 10, y + 5, 20 + Math.random() * 40, blockH - 10);
                }
            }
        }

        // Fine grain noise
        const imgData = ctx.getImageData(0, 0, 1024, 1024);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const noise = (Math.random() - 0.5) * 22;
            d[i] = Math.min(255, Math.max(0, d[i] + noise));
            d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise * 0.85));
            d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise * 0.6));
        }
        ctx.putImageData(imgData, 0, 0);

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    static createTerracottaRoofTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Warm terracotta base
        ctx.fillStyle = '#9C3D23';
        ctx.fillRect(0, 0, 512, 512);

        // Roman barrel tiles ridges
        const tileH = 24;
        const tileW = 48;

        for (let y = 0; y < 512; y += tileH) {
            const shift = (Math.floor(y / tileH) % 2) * (tileW / 2);
            for (let x = -tileW; x < 512 + tileW; x += tileW) {
                const varR = (Math.random() - 0.5) * 28;
                ctx.fillStyle = `rgb(${175 + varR}, ${65 + varR * 0.5}, ${38 + varR * 0.3})`;
                ctx.fillRect(x + shift, y, tileW - 2, tileH - 2);

                // Curved barrel highlight
                ctx.fillStyle = 'rgba(255, 190, 150, 0.35)';
                ctx.beginPath();
                ctx.ellipse(x + shift + tileW / 2, y + 4, tileW / 3, 3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Tile shadow seam
                ctx.fillStyle = 'rgba(50, 15, 5, 0.5)';
                ctx.fillRect(x + shift, y + tileH - 3, tileW, 3);
            }
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    static createCobblestoneTexture() {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 1024;
        const ctx = c.getContext('2d');

        // European old town stone road base
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 0, 1024, 1024);

        const stoneH = 32;
        const stoneW = 50;

        for (let y = 0; y < 1024; y += stoneH) {
            const shift = (Math.floor(y / stoneH) % 2) * (stoneW / 2);
            for (let x = -stoneW; x < 1024 + stoneW; x += stoneW) {
                const v = 160 + (Math.random() - 0.5) * 50;
                ctx.fillStyle = `rgb(${v}, ${v * 0.95}, ${v * 0.88})`;
                
                // Rounded cobblestone
                ctx.beginPath();
                ctx.roundRect(x + shift + 3, y + 3, stoneW - 6, stoneH - 6, 6);
                ctx.fill();

                // Highlight & mortar shadow
                ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(x + shift + 6, y + 5, stoneW - 12, 4);
            }
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
    }

    static createWoodPlankTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#5A381E'; // Dark weathered timber
        ctx.fillRect(0, 0, 512, 512);

        // Planks
        for (let y = 0; y < 512; y += 32) {
            const shade = (Math.random() - 0.5) * 30;
            ctx.fillStyle = `rgb(${100 + shade}, ${62 + shade * 0.6}, ${32 + shade * 0.3})`;
            ctx.fillRect(0, y + 1, 512, 30);

            // Wood grain lines
            ctx.strokeStyle = 'rgba(40, 20, 8, 0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(0, y + 4 + i * 6);
                ctx.lineTo(512, y + 4 + i * 6 + (Math.random() - 0.5) * 2);
                ctx.stroke();
            }

            // Plank shadow seam
            ctx.fillStyle = 'rgba(20, 10, 4, 0.6)';
            ctx.fillRect(0, y + 30, 512, 2);
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    static createWaterNormalMap() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#8080FF';
        ctx.fillRect(0, 0, 512, 512);

        // Wave normal vectors
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 45 + 15;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, 'rgba(160, 160, 255, 0.5)');
            grad.addColorStop(0.5, 'rgba(128, 128, 255, 0.3)');
            grad.addColorStop(1, 'rgba(128, 128, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const t = new THREE.CanvasTexture(c);
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(12, 12);
        return t;
    }

    static createMediterraneanWaterGradientMap() {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 1024;
        const ctx = c.getContext('2d');

        // Deep Mediterranean Sapphire Base
        ctx.fillStyle = '#023859';
        ctx.fillRect(0, 0, 1024, 1024);

        // Valletta Coastal Turquoise Shallows (Left)
        const leftGrad = ctx.createRadialGradient(200, 512, 50, 200, 512, 480);
        leftGrad.addColorStop(0, '#00E5FF'); // Sparkling turquoise shallows
        leftGrad.addColorStop(0.35, '#06B6D4');
        leftGrad.addColorStop(0.65, '#0284C7');
        leftGrad.addColorStop(1, 'rgba(2, 56, 89, 0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Gozo Coastal Shallows & Dwejra Blue Lagoon (Right)
        const rightGrad = ctx.createRadialGradient(824, 512, 60, 824, 512, 480);
        rightGrad.addColorStop(0, '#22D3EE');
        rightGrad.addColorStop(0.35, '#0EA5E9');
        rightGrad.addColorStop(0.7, '#0369A1');
        rightGrad.addColorStop(1, 'rgba(2, 56, 89, 0)');
        ctx.fillStyle = rightGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Azure Window Lagoon Highlights (Right-top)
        const lagoonGrad = ctx.createRadialGradient(880, 280, 20, 880, 280, 240);
        lagoonGrad.addColorStop(0, '#38BDF8');
        lagoonGrad.addColorStop(0.5, '#0284C7');
        lagoonGrad.addColorStop(1, 'rgba(2, 56, 89, 0)');
        ctx.fillStyle = lagoonGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    static createWaterCausticsTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);

        // Procedural Voronoi-like caustics light web
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;

        for (let i = 0; i < 90; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = 25 + Math.random() * 40;
            ctx.beginPath();
            ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.stroke();

            // Inner hot core
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(6, 6);
        return tex;
    }

    static createWaterFoamTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.clearRect(0, 0, 256, 256);

        // Organic foaming sea lace
        const grad = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        grad.addColorStop(0.85, 'rgba(224, 242, 254, 0.35)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Foam bubbles
        for (let i = 0; i < 120; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const r = Math.random() * 4 + 1.5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    static createStripedAwningTexture(c1 = '#DC2626', c2 = '#FFFFFF') {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        const stripeW = 32;
        for (let x = 0; x < 256; x += stripeW) {
            ctx.fillStyle = (Math.floor(x / stripeW) % 2 === 0) ? c1 : c2;
            ctx.fillRect(x, 0, stripeW, 256);
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    static createMalteseCrossBannerTexture(fieldColor = '#B91C1C', crossColor = '#FFFFFF') {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Banner field with swallowtail bottom cut
        ctx.fillStyle = fieldColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(256, 0);
        ctx.lineTo(256, 450);
        ctx.lineTo(128, 380);
        ctx.lineTo(0, 450);
        ctx.closePath();
        ctx.fill();

        // Gold border trim
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 8;
        ctx.stroke();

        // 8-Pointed Maltese Cross
        ctx.save();
        ctx.translate(128, 180);
        ctx.fillStyle = crossColor;

        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-45, -70);
            ctx.lineTo(0, -55);
            ctx.lineTo(45, -70);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    static createAWSBannerTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Dark charcoal/slate heraldic field with swallowtail bottom cut
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(256, 0);
        ctx.lineTo(256, 450);
        ctx.lineTo(128, 380);
        ctx.lineTo(0, 450);
        ctx.closePath();
        ctx.fill();

        // Vibrant AWS Orange border trim
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Inner gold pin-stripe
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(12, 12);
        ctx.lineTo(244, 12);
        ctx.lineTo(244, 435);
        ctx.lineTo(128, 368);
        ctx.lineTo(12, 435);
        ctx.closePath();
        ctx.stroke();

        // AWS Heraldic Crest / Crown
        ctx.fillStyle = '#FF9900';
        ctx.beginPath();
        ctx.arc(128, 70, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☁', 128, 70);

        // Bold "AWS" Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 52px "JetBrains Mono", sans-serif';
        ctx.fillText('AWS', 128, 160);

        // Subtitle "VALLETTA"
        ctx.fillStyle = '#FF9900';
        ctx.font = 'bold 18px "JetBrains Mono", sans-serif';
        ctx.fillText('VALLETTA', 128, 205);

        // Iconic Curved Orange Smile / Arrow
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(128, 200, 70, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();

        // Arrow head on smile
        ctx.fillStyle = '#FF9900';
        ctx.beginPath();
        ctx.moveTo(182, 246);
        ctx.lineTo(195, 235);
        ctx.lineTo(190, 258);
        ctx.closePath();
        ctx.fill();

        // Graviton4 ARM Badge
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
        ctx.fillText('GRAVITON 4', 128, 305);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    static createAzureBannerTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Deep Royal Azure Blue heraldic field with swallowtail bottom cut
        ctx.fillStyle = '#082F49';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(256, 0);
        ctx.lineTo(256, 450);
        ctx.lineTo(128, 380);
        ctx.lineTo(0, 450);
        ctx.closePath();
        ctx.fill();

        // Electric Cyan border trim
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Inner bright cyan pin-stripe
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(12, 12);
        ctx.lineTo(244, 12);
        ctx.lineTo(244, 435);
        ctx.lineTo(128, 368);
        ctx.lineTo(12, 435);
        ctx.closePath();
        ctx.stroke();

        // Azure Geometric Emblem (Trapezoid / "A" Crest)
        ctx.save();
        ctx.translate(128, 75);
        ctx.fillStyle = '#0078D4';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(26, 24);
        ctx.lineTo(10, 24);
        ctx.lineTo(0, 2);
        ctx.lineTo(-10, 24);
        ctx.lineTo(-26, 24);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Bold "AZURE" Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 44px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AZURE', 128, 160);

        // Subtitle "GOZO"
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 18px "JetBrains Mono", sans-serif';
        ctx.fillText('GOZO DWEJRA', 128, 205);

        // Sleek Cobalt 100 Emblem
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(128, 255, 32, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 15px "JetBrains Mono", sans-serif';
        ctx.fillText('COBALT 100', 128, 255);
        ctx.fillText('ARM64 ARCH', 128, 310);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    static createPuddleTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.clearRect(0, 0, 256, 256);

        // Organic wet splash / puddle contour
        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 115);
        grad.addColorStop(0, 'rgba(14, 165, 233, 0.85)');
        grad.addColorStop(0.5, 'rgba(3, 105, 161, 0.7)');
        grad.addColorStop(0.85, 'rgba(2, 44, 74, 0.5)');
        grad.addColorStop(1, 'rgba(2, 44, 74, 0)');
        ctx.fillStyle = grad;

        // Draw organic amoeba-like puddle shape
        ctx.beginPath();
        const numPoints = 16;
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const r = 90 + Math.sin(angle * 3) * 15 + Math.cos(angle * 5) * 10;
            const px = 128 + Math.cos(angle) * r;
            const py = 128 + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Sky specular glint highlight in puddle center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.ellipse(115, 110, 32, 16, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    static createSeaMistTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.clearRect(0, 0, 256, 256);

        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
        grad.addColorStop(0.4, 'rgba(186, 230, 253, 0.25)');
        grad.addColorStop(0.75, 'rgba(125, 211, 252, 0.08)');
        grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }
}

