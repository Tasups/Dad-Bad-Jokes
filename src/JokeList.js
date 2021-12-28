import React, { Component } from 'react';
import Joke from './Joke.js';
import './JokeList.css';
import uuid from "../node_modules/uuid/dist/v1.js";
import axios from 'axios';

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  }
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]")
    }
    let seenJokes;
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    console.log(seenJokes);
    this.handleClick = this.handleClick.bind(this);
  }
  
  componentDidMount() {
    if(this.state.jokes.length === 0){
      this.getJokes();
    }
  }
    
  async getJokes(){
    try {
    let jokes = []
    while (jokes.length < this.props.numJokesToGet) {
      let res = await axios.get("https://icanhazdadjoke.com/", {
      headers: { Accept: "application/json" }
      });
      let newJoke= res.data.joke;
      if (!this.seenJokes.has(newJoke)) {
        jokes.push({ id: uuid(), text: newJoke, votes: 0 })
        console.log(res.data);
      } else {
        console.log("FOUND A DUPLICATE!");
        console.log(res);
      }
    }
    this.setState(st => ({
      loading: false,
      jokes: [...st.jokes, ...jokes ]
    }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    window.localStorage.setItem("jokes", JSON.stringify(jokes)
      )
    } catch (error) {
      alert("Baad Joke network down: too many bad jokes!");
      this.setState({ loading: false });
    }
  }
  
  handleVote(id, delta) {
    this.setState(
      st => ({
        jokes: st.jokes.map(j => 
          j.id === id ? {...j, votes: j.votes + delta} : j
        )}
    ), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  
  handleClick(){
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading){
      return(
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
        )
    }
    let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
    return(
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            Very <span>Bad</span> Jokes
          </h1>
          <h2 className="JokeList-apology">I'm so sorry!</h2>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt="laughing face" />
          <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
        </div>
        
        <div className="JokeList-jokes">
          {/*{this.state.jokes.map(j => {
            return <div>{j.joke}-{j.votes}</div>;
          })}*/}
            {jokes.map(j => {
            return <Joke 
                    key={j.id} 
                    votes={j.votes} 
                    text={j.text} 
                    upVote={() => this.handleVote(j.id, 1)}
                    downVote={() => this.handleVote(j.id, -1)}
                    />;
          })}
        </div>
      </div>
      );
  }
}

export default JokeList;