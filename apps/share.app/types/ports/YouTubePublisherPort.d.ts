/**
 * YouTubePublisherPort - Port for interacting with YouTube Data API v3.
 */
export class YouTubePublisherPort {
    /**
     * Creates OAuth2 Google YouTube client.
     * @param {object} options
     * @returns {object}
     */
    static _createClient(options?: object): object;
    /**
     * @param {object} [options]
     * @param {object} [options.apiClient] - Preconfigured or mocked googleapis youtube client.
     * @param {string} [options.clientId]
     * @param {string} [options.clientSecret]
     * @param {string} [options.refreshToken]
     */
    constructor(options?: {
        apiClient?: object;
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
    });
    apiClient: any;
    /**
     * Publishes a regular or unlisted video to YouTube.
     * @param {object} params
     * @param {string} params.filePath - Local path to the video file.
     * @param {string} params.title - Video title.
     * @param {string} [params.description=''] - Video description.
     * @param {string[]} [params.tags=[]] - Video tags.
     * @param {'public'|'unlisted'|'private'} [params.privacyStatus='unlisted']
     * @param {string} [params.categoryId='22'] - Category (22 = People & Blogs).
     * @returns {Promise<{ success: boolean, videoId: string, url: string, privacyStatus: string }>}
     */
    publishVideo({ filePath, title, description, tags, privacyStatus, categoryId, }: {
        filePath: string;
        title: string;
        description?: string;
        tags?: string[];
        privacyStatus?: "public" | "unlisted" | "private";
        categoryId?: string;
    }): Promise<{
        success: boolean;
        videoId: string;
        url: string;
        privacyStatus: string;
    }>;
    /**
     * Publishes a short video, ensuring #Shorts hashtag is present.
     * @param {object} params
     * @param {string} params.filePath
     * @param {string} params.title
     * @param {string} [params.description='']
     * @param {string[]} [params.tags=[]]
     * @param {'public'|'unlisted'|'private'} [params.privacyStatus='public']
     * @returns {Promise<{ success: boolean, videoId: string, url: string, privacyStatus: string }>}
     */
    publishShort({ filePath, title, description, tags, privacyStatus, }: {
        filePath: string;
        title: string;
        description?: string;
        tags?: string[];
        privacyStatus?: "public" | "unlisted" | "private";
    }): Promise<{
        success: boolean;
        videoId: string;
        url: string;
        privacyStatus: string;
    }>;
}
