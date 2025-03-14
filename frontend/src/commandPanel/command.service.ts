export const postAdvanceTimeCycle = async (time: number) => {
    try {
        const response = await fetch(`http://localhost:8000/advance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ time }),
        });
        if (!response.ok) {
            throw new Error('Failed to advance time cycle');
        }
    } catch (error) {
        console.error('Error advancing time cycle:', error);
        throw error;
    }
}