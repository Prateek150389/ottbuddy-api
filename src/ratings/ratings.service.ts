import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
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

    // Read the current rating first so changing 3 -> 5 adjusts the
    // aggregate by +2 instead of counting another user.
    const existingResult = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk },
      }),
    );

    const existingRating =
      typeof existingResult.Item?.rating === 'number'
        ? existingResult.Item.rating
        : null;

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

    const summaryPk = `TITLE#${input.mediaType}#${input.tmdbId}`;
    const summarySk = 'RATING_SUMMARY';

    const ratingDelta =
      existingRating === null
        ? input.rating
        : input.rating - existingRating;

    const countDelta = existingRating === null ? 1 : 0;

    await this.client.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              Item: item,
            },
          },
          {
            Update: {
              TableName: this.tableName,
              Key: {
                pk: summaryPk,
                sk: summarySk,
              },
              UpdateExpression:
                'ADD ratingSum :ratingDelta, ratingCount :countDelta SET updatedAt = :updatedAt',
              ExpressionAttributeValues: {
                ':ratingDelta': ratingDelta,
                ':countDelta': countDelta,
                ':updatedAt': now,
              },
            },
          },
        ],
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

  async getRatingSummary(mediaType: MediaType, tmdbId: number) {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `TITLE#${mediaType}#${tmdbId}`,
          sk: 'RATING_SUMMARY',
        },
      }),
    );

    const ratingSum = Number(result.Item?.ratingSum ?? 0);
    const ratingCount = Number(result.Item?.ratingCount ?? 0);

    return {
      average:
        ratingCount > 0
          ? Number((ratingSum / ratingCount).toFixed(1))
          : 0,
      count: ratingCount,
    };
  }
}
