// Test script to validate lead creation and update
const testLeadValidation = async () => {
    // Test 1: Create a lead with all required fields
    console.log('Test 1: Creating lead with all required fields...');
    const createResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
            name: 'Test Lead',
            phone: '+1234567890',
            stage: 1,
            business_id: 1,
            notes: 'Test notes',
            tags: ['test-tag']
        })
    });
    
    if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('✅ Lead created successfully:', result);
        
        // Test 2: Update the lead
        console.log('\nTest 2: Updating lead...');
        const updateResponse = await fetch(`/api/leads/${result.lead.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                name: 'Updated Test Lead',
                phone: '+1234567890',
                stage: 2,
                business_id: 1,
                notes: 'Updated notes',
                tags: ['updated-tag']
            })
        });
        
        if (updateResponse.ok) {
            console.log('✅ Lead updated successfully');
        } else {
            console.error('❌ Failed to update lead');
        }
        
        // Test 3: Try to create lead with invalid data
        console.log('\nTest 3: Testing validation with invalid data...');
        const invalidResponse = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                name: '',
                phone: '',
                stage: 99,
                business_id: 999
            })
        });
        
        if (!invalidResponse.ok) {
            const error = await invalidResponse.json();
            console.log('✅ Validation working correctly:', error);
        } else {
            console.error('❌ Validation failed - invalid data was accepted');
        }
    } else {
        console.error('❌ Failed to create lead');
    }
};

// Uncomment to run tests in browser console
// testLeadValidation();
