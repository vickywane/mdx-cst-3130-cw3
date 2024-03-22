export interface News {
    title: string
    url: string
    time_published: string
    authors: string
    summary: string
    banner_image: string
    source: string
    category_within_source: string;
    source_domain: string;
    topics: Array<string>;
    overall_sentiment_score: number,
    overall_sentiment_label: string,
    ticker_sentiment: Array<string>
}

// ITEM => 20240320T201500
// ITEM => 20240320T201500
// ITEM => 20240320T182101
// ITEM => 20240320T173250
// ITEM => 20240320T170906
// ITEM => 20240320T170000 