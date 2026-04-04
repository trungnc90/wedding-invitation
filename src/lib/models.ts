import { ObjectId } from "mongodb";

/** Shared base type for all person entities (bride, groom, parents) */
export interface Person {
  firstName: string;
  lastName: string;
  christianName?: string;
}

/** Bride/Groom extend Person with profile fields */
export interface WeddingPerson extends Person {
  photo: string;
  bio: string;
  father?: Person;
  mother?: Person;
}

export interface Wedding {
  _id: ObjectId;
  couple: {
    bride: WeddingPerson;
    groom: WeddingPerson;
    loveStory: string;
  };
  heroPhoto: string;
  heroPhotoMobile?: string;
  weddingDate: Date;
  events: Array<{
    _id: ObjectId;
    title: string;
    date: Date;
    time: string;
    venueName: string;
    venueAddress: string;
  }>;
  gallery: Array<{
    _id: ObjectId;
    url: string;
    thumbnailUrl: string;
    driveFileId?: string;
    order: number;
  }>;
  translations?: {
    en?: {
      couple?: {
        bride?: { firstName?: string; lastName?: string; bio?: string };
        groom?: { firstName?: string; lastName?: string; bio?: string };
        loveStory?: string;
      };
      events?: Array<{
        _id: ObjectId;
        title?: string;
        venueName?: string;
        venueAddress?: string;
      }>;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RSVP {
  _id: ObjectId;
  name: string;
  attending: boolean;
  numberOfAttendees: number;
  message?: string;
  createdAt: Date;
}

export interface Wish {
  _id: ObjectId;
  name: string;
  message: string;
  approved: boolean;
  createdAt: Date;
}
