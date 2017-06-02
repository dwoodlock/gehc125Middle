//handleLike.js
//
import momentsDb from './momentsDb';
import immutable from 'immutable';
import {setItem} from './localPouch';

const handleLike = async (req, res) => {
  console.log("got a post at /like");
  console.log("here's the body: ", req.body);
  const userId = req.body.userId;
  const momentId = req.body.momentId;
  const action = req.body.action; //LIKE_MOMENT or UNLIKE_MOMENT
  try {
    const moment = await momentsDb.get(momentId);
    const likes = immutable.Set(moment.likes);
    const newLikes = (action === 'LIKE_MOMENT') ? likes.add(userId) : likes.delete(userId);
    const newMoment = Object.assign({}, moment, {likes: newLikes.toJS()});
    console.log(newMoment);
    setItem(momentsDb, momentId, newMoment);
    res.send(newMoment);
    }
  catch(e) {
    console.log(e);
  }
}

export default handleLike;
