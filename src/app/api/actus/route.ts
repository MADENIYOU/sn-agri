import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';


const scrapeSenenewsPage = async (pageNumber: number) => {
    const url = pageNumber === 2
    ? 'https://www.senenews.com/category/actualites/economie/agriculture-2 '
    : `https://www.senenews.com/category/actualites/economie/agriculture-2/page/${pageNumber}`;

    try {
        const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Erreur lors du chargement de ${url}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const articles: {
        title: string;
        date: string;
        image: string;
        excerpt: string;
        url: string;
    }[] = [];

    $('article').each((_, el) => {
        const title = $(el).find('header h2').text().trim();
        const url = $(el).find('a').first().attr('href') || '';
        const image = $(el).find('img').attr('src') || '';
        const excerpt = $(el).find('.content_description').text().trim() || '';
        
        const date = '';

        if (title && url) {
        articles.push({ title, date, image, excerpt, url });
        }
    });

    return articles;

    } catch (error) {
        console.error(`Erreur lors du scraping de la page ${pageNumber} :`, error);
        return [];
    }
};

export async function GET() {
    try {
        const scrapeSite = async (url: string) => {
        const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
        });

        if (!res.ok) throw new Error(`Erreur lors du chargement de ${url}`);

        const html = await res.text();
        const $ = cheerio.load(html);
        const articles: {
            title: string;
            date: string;
            image: string;
            excerpt: string;
            url: string;
        }[] = [];

        $('.blog-listing').each((_, el) => {
            const title = $(el).find('.entry-title a').text().trim();
            const url = $(el).find('.entry-title a').attr('href') || '';
            const date = $(el).find('.entry-date a').text().trim();
            const image = $(el).find('.entry-thumbnail img').attr('src') || '';
            const excerpt = $(el).find('.entry-content p').text().trim();

        if (title && url) {
            articles.push({ title, date, image, excerpt, url });
        }
        });

        return articles;
    };

    const articlesGovSn = await scrapeSite('https://agriculture.gouv.sn/category/actualite/ ');

    
    const totalPages = 23;
    const senenewsPromises = [];

    for (let i = 1; i <= totalPages; i++) {
        senenewsPromises.push(scrapeSenenewsPage(i));
    }

    const senenewsPages = await Promise.all(senenewsPromises);
    const articlesSenenews = senenewsPages.flat();

    //On fusionne
    const allArticles = [...articlesGovSn, ...articlesSenenews];

    return NextResponse.json(allArticles);

    } catch (error) {
        return NextResponse.json({ error: 'Erreur interne', details: String(error) }, { status: 500 });
    }
}