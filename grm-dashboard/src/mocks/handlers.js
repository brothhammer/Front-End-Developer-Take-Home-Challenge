import { http, HttpResponse } from 'msw'
import mockData from './mockData'

export const handlers = [
  http.get('/data.json', () => {
    return HttpResponse.json(mockData)
  })
]
