import * as React from 'react';
import { IHomeProps } from './IHomeProps';

const Home: React.FC<IHomeProps> = (props) => {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the default home page.</p>
        </div>
    )
};

export default Home;