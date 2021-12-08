import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  console.log(postsPagination.next_page)
  return (
    <>
      <main className={commonStyles.main}>
        <div className={commonStyles.container}>
          {postsPagination.results.map(data => (
            <Link href={`post/${data.uid}`}>
              <section className={commonStyles.post} key={data.uid}>
                <h2>{data.data.title}</h2>
                <h4>{data.data.subtitle}</h4>
                <div className={commonStyles.info}>
                  <FiCalendar />
                  <small>
                    { format(new Date(data.first_publication_date), "dd LLL yyyy", {locale: ptBR})}
                  </small>
                  <FiUser />
                  <small>{data.data.author}</small>
                </div>
              </section>
            </Link>
          ))}

          <button >Carregar mais posts</button>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'pos')],
    {
      fetch: ['pos.title', 'pos.author', 'pos.subtitle'],
      pageSize: 3,
    }
  );
  console.log(postsResponse);

  const postFormated: Post[] = postsResponse.results.map(data => {
    return {
      uid: data.uid,
      first_publication_date: data.first_publication_date,
      data: {
        title: data.data.title,
        subtitle: data.data.subtitle,
        author: data.data.author,
      },
    };
  });
  console.log(postFormated);
  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postFormated,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30 // 30 minutes
  };
};
