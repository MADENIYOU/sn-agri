'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowLeft, FaArrowRight, FaSpinner } from 'react-icons/fa'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const POSTS_PER_PAGE = 12
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const Pagination = ({ handlePrev, handleNext, currentPage, totalPages }) => (
    <div className="flex justify-center items-center mt-10 mb-5 space-x-4">
        <Button onClick={handlePrev} disabled={currentPage === 1} variant="outline">
            <FaArrowLeft className="mr-2" /> Précédent
        </Button>

        <span className="text-sm text-muted-foreground font-medium">
            Page <strong className="text-primary">{currentPage}</strong> sur{' '}
            <strong className="text-primary">{totalPages}</strong>
        </span>

        <Button onClick={handleNext} disabled={currentPage === totalPages} variant="outline">
            Suivant <FaArrowRight className="ml-2" />
        </Button>
    </div>
);

export default function ActusBubbles() {
  const [articles, setArticles] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(true)

  const currentPage = page + 1;

  useEffect(() => {
    const fetchArticles = async () => {
      const cachedData = localStorage.getItem('news_articles');
      const cachedTimestamp = localStorage.getItem('news_timestamp');
      const now = new Date().getTime();

      if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp, 10)) < CACHE_DURATION) {
        setArticles(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/actus');
        const data = await res.json();
        setArticles(data);
        localStorage.setItem('news_articles', JSON.stringify(data));
        localStorage.setItem('news_timestamp', now.toString());
      } catch (err) {
        console.error('Erreur lors du chargement des articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [])

  // Calcul des pages
  const totalPages = Math.ceil(articles.length / POSTS_PER_PAGE)
  const currentPosts = articles.slice(
    page * POSTS_PER_PAGE,
    (page + 1) * POSTS_PER_PAGE
  )

  const paginate = (newPage: number, newDirection: number) => {
    setPage(newPage);
    setDirection(newDirection);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
        paginate(page + 1, 1);
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
        paginate(page - 1, -1);
    }
  }

  return (
    <>
      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin text-primary text-3xl" />
          <span className="ml-2 text-primary font-medium">Chargement des actualités...</span>
        </div>
      )}

      {!loading && totalPages > 1 && <Pagination handlePrev={handlePrev} handleNext={handleNext} currentPage={currentPage} totalPages={totalPages} />}

      {/* Grille d'articles avec animations */}
      {!loading && (
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {currentPosts.map((a, idx) => (
                <Card key={`article-${currentPage}-${idx}`} className="h-full flex flex-col">
                  {a.image && (
                    <CardHeader className="p-0">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="rounded-t-lg w-full h-44 object-cover"
                      />
                    </CardHeader>
                  )}
                  <CardContent className="flex-grow p-4">
                    <CardTitle className="text-lg font-bold line-clamp-2 mb-2">{a.title}</CardTitle>
                    {a.date && <p className="text-xs text-muted-foreground mt-1">{a.date}</p>}
                    {a.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button asChild variant="link" className="p-0">
                        <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        Lire plus →
                        </a>
                    </Button>
                  </CardFooter>
                </Card>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination stylisée */}
      {!loading && totalPages > 1 && <Pagination handlePrev={handlePrev} handleNext={handleNext} currentPage={currentPage} totalPages={totalPages} />}
    </>
  )
}