import {
  EVENT_STATUSES,
  EventModel,
  type EventStatus,
} from "../models/event.model.js";

const LOCATIONS = [
  "Prague Congress Centre",
  "Brno Exhibition Centre",
  "Ostrava Arena",
  "Lucerna Music Bar",
  "DOX Centre for Contemporary Art",
  "National Theatre",
  "Výstaviště Holešovice",
  "Forum Karlín",
  "Palác Akropolis",
  "Stromovka Park",
];

const TITLES = [
  "Tech Meetup",
  "Design Workshop",
  "Product Launch",
  "Networking Night",
  "Startup Pitch",
  "AI Conference",
  "Music Festival",
  "Art Exhibition",
  "Food & Wine Tasting",
  "Yoga in the Park",
  "Hackathon",
  "Book Club",
  "Photography Walk",
  "Coding Bootcamp",
  "Community BBQ",
  "Film Screening",
  "Dance Performance",
  "Science Fair",
  "Charity Gala",
  "Open Mic Night",
];

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!;
}

export async function generateEvents(count = 20): Promise<void> {
  await EventModel.deleteMany({});

  const now = Date.now();
  const events = Array.from({ length: count }, (_, index) => ({
    title: `${pick(TITLES, index)} #${index + 1}`,
    description:
      index % 3 === 0 ? `Sample description for event ${index + 1}.` : undefined,
    date: new Date(now + (index + 1) * 24 * 60 * 60 * 1000),
    location: pick(LOCATIONS, index),
    status: pick(EVENT_STATUSES, index) as EventStatus,
  }));

  await EventModel.insertMany(events);
  console.log(`Seeded ${count} events`);
}
