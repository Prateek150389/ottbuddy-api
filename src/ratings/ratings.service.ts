import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

export type MediaType = 'movie' | 'tv';

export interface SaveRatingInput {
  mediaType: MediaType;
  tmdbId: number;
  rating: number;
  anonymousId?: string;
  userId?: string;
}

@Injectable()
export class RatingsService {
  private readonly tableName =
    process.env.DYNAMODB_RATINGS_TABLE ?? 'ottbuddy-ratings';

  private readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'ap-south-1',
    }),
  );

  async saveRating(input: SaveRatingInput) {
    const identity = input.userId ?? input.anonymousId;

    if (!identity) {
      throw new Error('A userId or anonymousId is required');
    }

    const pk = input.userId
      ? `USER#${input.userId}`
      : `GUEST#${input.anonymousId}`;

    const sk = `RATING#${input.mediaType}#${input.tmdbId}`;
    const now = new Date().toISOString();

    const item = {
      pk,
      sk,
      userId: input.userId,
      anonymousId: input.anonymousId,
      mediaType: input.mediaType,
      tmdbId: input.tmdbId,
      rating: input.rating,
      updatedAt: now,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      }),
    );

    return item;
  }

  async getRating(
    mediaType: MediaType,
    tmdbId: number,
    anonymousId?: string,
    userId?: string,
  ) {
    const identity = userId ?? anonymousId;

    if (!identity) {
      return null;
    }

    const pk = userId
      ? `USER#${userId}`
      : `GUEST#${anonymousId}`;

    const sk = `RATING#${mediaType}#${tmdbId}`;

    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk },
      }),
    );

    return result.Item ?? null;
  }
}
