import { Component } from 'react';
import Head from 'next/head';


export default class extends Component {
  // static async getInitialProps () {
  //   // fetch list of posts
  //   const response = await fetch('https://jsonplaceholder.typicode.com/posts?_page=1')
  //   const postList = await response.json()
  //   return { postList }
  // }

  render () {
    return (
      <main>
        <Head>
          <title>杂货铺</title>
        </Head>

        <h1>just for test</h1>

        <section></section>
          {/* {this.props.postList.map(post => <Post {...post} key={post.id} />)} */}
        </section>
      </main>
    )
  }
}