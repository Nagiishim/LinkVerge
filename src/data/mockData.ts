import type { Product } from "../schemas/product.js";

export const mockProducts: Product[] = [
  {
    product_id: "mock-python-course",
    title: "Complete Python Beginner Course",
    creator: "FindIt Mock Academy",
    description: "A beginner-friendly Python programming course.",
    category: "Tech & Coding",
    product_type: "course",
    price: 15000,
    currency: "NGN",
    rating: 4.5,
    attributes: {
      topic: "Python",
      level: "beginner",
      format: "video",
      audience: "beginners",
    },
    product_url: "https://example.com/python-course",
  },

  {
    product_id: "mock-web-course",
    title: "Modern Web Development Course",
    creator: "FindIt Mock Academy",
    description:
      "Learn HTML, CSS and JavaScript from beginner to intermediate level.",
    category: "Tech & Coding",
    product_type: "course",
    price: 20000,
    currency: "NGN",
    rating: 4.7,
    attributes: {
      topic: "web development",
      level: "beginner",
      format: "video",
      audience: "developers",
    },
    product_url: "https://example.com/web-course",
  },

  {
    product_id: "mock-social-template",
    title: "Social Media Content Template Pack",
    creator: "FindIt Mock Studio",
    description:
      "Ready-to-use templates for social media content creation.",
    category: "Social Media",
    product_type: "template",
    price: 8000,
    currency: "NGN",
    rating: 4.3,
    attributes: {
      topic: "social media",
      format: "template",
      audience: "creators",
    },
    product_url: "https://example.com/social-templates",
  },

  {
    product_id: "mock-video-guide",
    title: "Video Editing Beginner Guide",
    creator: "FindIt Mock Studio",
    description:
      "A practical guide for beginners learning video editing.",
    category: "Video & Content",
    product_type: "guide",
    price: 5000,
    currency: "NGN",
    rating: 4.1,
    attributes: {
      topic: "video editing",
      level: "beginner",
      format: "PDF",
      audience: "creators",
    },
    product_url: "https://example.com/video-guide",
  },

  {
    product_id: "mock-business-ebook",
    title: "Small Business Growth Guide",
    creator: "FindIt Mock Business",
    description:
      "A practical guide covering fundamentals of growing a small business.",
    category: "Business & Money",
    product_type: "ebook",
    price: 10000,
    currency: "NGN",
    rating: 4.4,
    attributes: {
      topic: "business",
      level: "beginner",
      format: "ebook",
      audience: "entrepreneurs",
    },
    product_url: "https://example.com/business-guide",
  },
];