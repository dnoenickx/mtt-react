import { Segment, SegmentEvent } from './types';


export async function getSegment(segmentId: number): Promise<Segment> {
  const response = await fetch(`http://127.0.0.1:5000/segment/${segmentId}`);
  const data = await response.json();
  data.events.forEach((event: SegmentEvent) => {
    event.date = new Date(event.date);
  });
  return data;
}
