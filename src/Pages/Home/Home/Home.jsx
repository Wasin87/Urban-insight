import React from 'react';
import Banner from '../Banner/Banner';
import Work from '../../Work/Work';
import Service from '../../Service/Service';
// import Brands from '../Brands/Brands';
// import Reviews from '../Reviews/Reviews';

// const reviewsPromise = fetch('/reviews.json')
// .then(res => res.json());

const Home = () => {
    return (
        <div>
            
            <Banner></Banner>
            <Work></Work>
            <Service></Service>
            {/* <div className='mt-20'>
                  <Brands></Brands>
            </div> */}
            
            {/* <Reviews reviewsPromise = {reviewsPromise}></Reviews> */}
        </div>
    );
};

export default Home;