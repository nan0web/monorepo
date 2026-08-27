import { CommentModel } from './CommentModel.js';
/**
 * TestimonialModel — OLMUI Model-as-Schema
 * Extends CommentModel with a rating field for testimonials/reviews.
 */
export declare class TestimonialModel extends CommentModel {
    static $id: string;
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
}
