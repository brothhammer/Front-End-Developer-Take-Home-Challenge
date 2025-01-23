import { http, HttpResponse, delay } from 'msw'
import mockData from './mockData'

export const handlers = [
  http.get('/data.json', async () => {
    await delay(2000)

    // Randomly fail 25% of the time
    // if (Math.random() > 0.75) {
    //   return new HttpResponse(null, {
    //     status: 500,
    //     statusText: 'Internal Server Error'
    //   })
    // }

    return HttpResponse.json(mockData)
  }),

  http.put('/api/acknowledge/:id', async ({ params }) => {
    await delay(1000) // Add a delay to simulate network
    const { id } = params

  // Randomly fail 25% acknowledgments
  if (Math.random() > 0.75) {
    return new HttpResponse(
      JSON.stringify({
        error: 'Failed to acknowledge alert',
        message: 'Server error occurred'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
    
    return HttpResponse.json({
      success: true,
      message: `Alert ${id} acknowledged`,
      alertId: id,
      acknowledged: true
    })
  })
]
