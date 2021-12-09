import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import PrismicDOM from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Comments from '../../components/Comments';
import Link from 'next/link';

type AdjacentsPosts = {
  uid: string | null;
  title: string | null;
};

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  previousPost: AdjacentsPosts;
  nextPost: AdjacentsPosts;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const isFallback = router.isFallback;
  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  function countWords() {
    let totalWords = 0;
    const toText = post.data.content.map(data => {
      return PrismicDOM.RichText.asText(data.body);
    });

    for (let e of toText) {
      totalWords = e.match(/(\w+)/g).length;
    }
    return Math.round(totalWords / 200);
  }

  return (
    <main className={styles.main}>
      <img
        src={post.data.banner.url}
        alt="image from the article"
        className={styles.postImage}
      />
      <div className={styles.container}>
        <article>
          <h1 key-={post.data.title}>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar />
            <small>
              {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
                locale: ptBR,
              })}
            </small>
            <FiUser />
            <small>{post.data.author}</small>
            <FiClock />
            <small>{`${countWords()} min`}</small>
          </div>
          <small className={styles.editedAt}>
            {format(
              new Date(post.last_publication_date),
              "'*editado em 'dd'  de 'LLL' de 'yyyy 'ás 'p'",
              {
                locale: ptBR,
              }
            )}
          </small>
          {post.data.content.map(data => {
            return (
              <>
                <div
                  dangerouslySetInnerHTML={{ __html: data.heading }}
                  className={styles.heading}
                />
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(data.body),
                  }}
                />
              </>
            );
          })}
        </article>
        <nav className={styles.navContainer}>
          <div className={styles.navigation}>
            {post.previousPost.title ? (
              <h4>{post.previousPost.title}</h4>
            ) : (
              <h1></h1>
            )}
            {post.nextPost.title ? (
              <h4>{post.nextPost.title}</h4>
            ) : (
              <h1></h1>
            )}
          </div>
          <div className={styles.navigation}>
            {post.previousPost.uid ? (
              <Link href={post.previousPost.uid}>
                <a href="">Post Anterior</a>
              </Link>
            ) : (
              <h1></h1>
            )}
            {post.nextPost.uid ? (
              <Link href={post.nextPost.uid}>
                <a href="">Próximo Post</a>
              </Link>
            ) : (
              <h1></h1>
            )}
          </div>
        </nav>
        <div className={styles.postSection}>
          <Comments />
        </div>
      </div>
    </main>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'pos')
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid.toString() },
  }));

  const pathsTest = paths.splice(1);

  return { paths: pathsTest, fallback: true };
};

export const getStaticProps = async context => {
  const slug = context.params.slug;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('pos', String(slug), {});
  const preevpost = await prismic.getByUID('pos', String(slug), {
    after: `${response.uid}`,
  });
  const prevPost = (
    await prismic.query([Prismic.predicates.at('document.type', 'pos')], {
      fetch: ['pos.title'],
      orderings: '[my.post.date]',
      pageSize: 1,
      after: `${response.id}`,
    })
  ).results[0];

  const nexPost = (
    await prismic.query([Prismic.predicates.at('document.type', 'pos')], {
      orderings: '[document.first_publication_date desc]',
      fetch: ['pos.title'],
      pageSize: 1,
      after: `${response.id}`,
    })
  ).results[0];

  console.log(JSON.stringify(nexPost) + ' oi');

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    previousPost: {
      uid: prevPost?.slugs[0] || null,
      title: prevPost?.data.title || null,
    },
    nextPost: {
      uid: nexPost?.slugs[0] || null,
      title: nexPost?.data.title || null,
    },
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(data => ({
        heading: data.heading,
        body: data.body,
      })),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
