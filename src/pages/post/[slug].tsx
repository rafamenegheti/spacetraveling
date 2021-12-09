import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import PrismicDOM from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { RichText, RichTextBlock } from 'prismic-reactjs';

interface Post {
  first_publication_date: string | null;
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
  const isFallback = router.isFallback
  if (isFallback) {
    return <h1>Carregando...</h1>;
  }


  function countWords() {
    let totalWords = 0;
    const toText = post.data.content.map(data => {
      return(
      PrismicDOM.RichText.asText(data.body)
      )
    })

    for(let e of toText) {
      totalWords = e.match(/(\w+)/g).length;
    }
    return Math.round((totalWords/200))
  }

  countWords()

  return (
    <main className={styles.main}>
      <img
        src={post.data.banner.url}
        alt="image from the article"
        className={styles.postImage}
      />
      <div className={styles.container}>
        <article>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <FiCalendar />
            <small>
              {' '}
              {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
                locale: ptBR,
              })}{' '}
            </small>
            <FiUser />
            <small>{post.data.author}</small>
            <FiClock />
            <small>{`${countWords()} min`}</small>
          </div>
          {post.data.content.map(data => {
            return (
              <>
                <div dangerouslySetInnerHTML={{ __html: data.heading }} className={styles.heading}/>
                <div dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(data.body) }} />
              </>
            );
          })}
        </article>
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
  console.log(pathsTest)

  return { paths: pathsTest, fallback: true };
};

export const getStaticProps = async context => {
  const slug = context.params.slug;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('pos', String(slug), {});

  //console.log(response);

  const post = {
    first_publication_date: response.first_publication_date,
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
