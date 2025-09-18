# User Engagement API Endpoints

This document describes the API endpoints for user engagement features including personalized recommendations, search enhancements, and personalized offers.

## Table of Contents
- [AI-Powered Recommendations](#ai-powered-recommendations)
- [Enhanced Search](#enhanced-search)
- [Personalized Offers](#personalized-offers)
- [Trending Products](#trending-products)
- [Search Suggestions](#search-suggestions)

## AI-Powered Recommendations

### `GET /api/recommendations-ai`

Get AI-powered personalized product recommendations for the authenticated user.

#### Authentication
- Required: Yes (JWT token in Authorization header)

#### Query Parameters
None

#### Response
```json
[
  {
    "id": 1,
    "name": "Ruby Necklace",
    "description": "Beautiful ruby necklace",
    "price": 2500,
    "images": ["/images/ruby1.jpg"],
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Necklaces"
    },
    "averageRating": 4.5,
    "reviewCount": 12,
    "reason": "Based on your previous purchases"
  }
]
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | number | Product ID |
| name | string | Product name |
| description | string | Product description |
| price | number | Product price |
| images | array | Array of image URLs |
| categoryId | number | Category ID |
| category | object | Category information |
| averageRating | number | Average product rating |
| reviewCount | number | Number of reviews |
| reason | string | Reason for recommendation |

#### Error Responses
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

## Enhanced Search

### `GET /api/search-enhanced`

Get enhanced search suggestions, trending searches, and popular categories.

#### Authentication
- Required: No

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query term |
| limit | number | No | Number of results to return (1-20, default: 5) |

#### Response
```json
{
  "suggestions": [
    {
      "id": 1,
      "name": "Ruby Necklace",
      "category": "Necklaces",
      "image": "/images/ruby1.jpg",
      "price": 2500,
      "popularity": 90,
      "type": "product"
    }
  ],
  "trending": [
    {
      "id": 2,
      "name": "Emerald Ring",
      "category": "Rings",
      "image": "/images/emerald1.jpg",
      "price": 3000,
      "popularity": 150,
      "type": "trending"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Necklaces",
      "count": 25
    }
  ]
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| suggestions | array | Search suggestions based on query |
| trending | array | Trending products |
| categories | array | Popular categories |

#### Error Responses
- `400 Bad Request` - Invalid limit parameter
- `500 Internal Server Error` - Server error

## Personalized Offers

### `GET /api/personalized-offers`

Get personalized offers for the authenticated user.

#### Authentication
- Required: Yes (JWT token in Authorization header)

#### Query Parameters
None

#### Response
```json
[
  {
    "id": 1,
    "title": "Gold Tier Bonus",
    "description": "Exclusive Gold member discount",
    "discountPercentage": 15,
    "type": "loyalty_bonus",
    "applicableTo": "loyalty_members",
    "tier": "Gold"
  }
]
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | number | Offer ID |
| title | string | Offer title |
| description | string | Offer description |
| discountPercentage | number | Discount percentage |
| type | string | Offer type (loyalty_bonus, birthday, anniversary, etc.) |
| applicableTo | string | Who the offer applies to |
| tier | string | (Optional) Loyalty tier required |
| pointsRequired | number | (Optional) Points required for redemption |
| categories | array | (Optional) Categories the offer applies to |
| endTime | string | (Optional) Offer expiration time |

#### Error Responses
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

## Trending Products

### `GET /api/trending`

Get trending products based on views, purchases, and ratings.

#### Authentication
- Required: No

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of products to return (1-50, default: 10) |

#### Response
```json
[
  {
    "id": 1,
    "name": "Ruby Necklace",
    "description": "Beautiful ruby necklace",
    "price": 2500,
    "images": ["/images/ruby1.jpg"],
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Necklaces"
    },
    "averageRating": 4.5,
    "reviewCount": 12,
    "viewCount": 150
  }
]
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | number | Product ID |
| name | string | Product name |
| description | string | Product description |
| price | number | Product price |
| images | array | Array of image URLs |
| categoryId | number | Category ID |
| category | object | Category information |
| averageRating | number | Average product rating |
| reviewCount | number | Number of reviews |
| viewCount | number | Number of views |

#### Error Responses
- `400 Bad Request` - Invalid limit parameter
- `500 Internal Server Error` - Server error

## Search Suggestions

### `GET /api/search-suggestions`

Get search suggestions for autocomplete functionality.

#### Authentication
- Required: No

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query term |
| limit | number | No | Number of results to return (1-20, default: 10) |

#### Response
```json
[
  {
    "id": 1,
    "name": "Ruby Necklace",
    "category": "Necklaces",
    "type": "product"
  }
]
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | number | Item ID |
| name | string | Item name |
| category | string | Category name |
| type | string | Item type (product or category) |

#### Error Responses
- `400 Bad Request` - Missing query parameter or invalid limit
- `500 Internal Server Error` - Server error