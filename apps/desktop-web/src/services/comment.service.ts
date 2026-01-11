import { request } from "./httpClient";
import { authorizedJsonRequest, buildQueryString } from "./apiClient";

export type CommentItem = {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
};

export type CommentListResponse = {
  items: CommentItem[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export const commentService = {
  list(adId: string, params?: { page?: number; limit?: number }) {
    const query = buildQueryString({
      page: params?.page,
      limit: params?.limit,
    });
    return request<CommentListResponse>(`/ads/${adId}/comments${query}`);
  },
  create(adId: string, text: string, token: string) {
    return authorizedJsonRequest<CommentItem>(`/ads/${adId}/comments`, token, "POST", { text });
  },
};
