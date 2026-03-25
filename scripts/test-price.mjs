// Rigorous test for the new 3D diamond pricing (Shape x Carat x Quality)
async function test() {
    console.log('--- 💎 3D Diamond Pricing Verification ---');

    // 1. Fetch all dependencies
    const [styles, metals, diamonds, settings, carats, shapes] = await Promise.all([
        fetch('http://localhost:3000/api/ring-styles').then(r => r.json()),
        fetch('http://localhost:3000/api/metals').then(r => r.json()),
        fetch('http://localhost:3000/api/diamonds').then(r => r.json()), // Qualities
        fetch('http://localhost:3000/api/settings').then(r => r.json()),
        fetch('http://localhost:3000/api/carats').then(r => r.json()),
        fetch('http://localhost:3000/api/shapes?all=true').then(r => r.json()),
    ]);

    const style = styles.find(s => s.slug === 'channel-ascent');
    const metal = metals.find(m => m.purity === '18K');
    const setting = settings[0];
    const carat = carats[0]; // Should be 1.00ct
    const shape = shapes.find(s => s.slug === 'round');
    const quality = diamonds.find(d => d.clarity === 'VVS' && d.color === 'EF'); // The new one we seeded

    if (!quality) {
        console.error('❌ VVS EF quality not found in database.');
        return;
    }

    console.log(`Testing with:\n- Shape: ${shape.name}\n- Carat: ${carat.value}\n- Quality: ${quality.clarity} ${quality.color}`);

    // 2. Call pricing API
    const res = await fetch('http://localhost:3000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ringStyleId: style.id,
            metalId: metal.id,
            diamondId: quality.id, // Passing Quality ID
            settingId: setting.id,
            caratOptionId: carat.id,
            shapeId: shape.id,     // Passing Shape ID
        }),
    });

    const data = await res.json();

    if (data.breakdown && data.breakdown.diamondPrice === 22000) {
        console.log('✅ SUCCESS: Correct rate (₹22,000) retrieved for Round/1ct/VVS-EF.');
    } else {
        console.log('❌ FAILURE: Expected ₹22,000 diamond price, got:', data.breakdown?.diamondPrice);
    }

    console.log('\nFull Result:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
