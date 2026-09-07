/**
 * TestimonialModel — OLMUI Model-as-Schema
 * Extends CommentModel with a rating field for testimonials/reviews.
 */
export class TestimonialModel extends CommentModel {
    static rating: {
        help: string;
        default: number;
        type: string;
    };
    /**
     * @param {Partial<TestimonialModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<TestimonialModel> | Record<string, any>, options?: object);
    /** @type {number} Rating from 1 to 5 stars */ rating: number;
}
import { CommentModel } from './CommentModel.js';
