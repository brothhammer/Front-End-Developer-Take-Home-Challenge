import { http, HttpResponse, delay } from 'msw'
import mockData from './mockData'

export const handlers = [
  http.get('/data.json', async () => {
    await delay(2000) // 2 second delay

    // Randomly fail 25% of the time
    if (Math.random() > 0.75) {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Internal Server Error'
      })
    }

    return HttpResponse.json(mockData)
  })
]
