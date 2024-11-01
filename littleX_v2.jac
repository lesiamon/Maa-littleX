import:py from sentence_transformers { SentenceTransformer, util }
import:py numpy as np;
node Hastag_node {}

node Hastag {
    has tag: str;
}

node Feed_node {
    has Tag_prob:dict = {};
    has n:int = 0;
    @classmethod
    can Update_prob(tag:str){
        Sum = sum(Tag_prob.values());
        if tag not in Tag_prob.keys(){
            Tag_prob[tag] = 0.0;
        }
        Tag_prob = {key: ((value*Sum +1)/(Sum+1)) if key==tag else key: ((value*Sum)/(Sum+1)) for key, value in Tag_prob.items()};
        n += 1;
    }
    @classmethod
    can get_high_hastag(){
        :g: hastag_node;
        high_key = max(Tag_prob, key=Tag_prob.get);
        for hastag in [hastag_node-->]{
            if hastag.tag == high_key{
                return hastag;
            }
        }
        return None;
    }
}

node Tweet_main {}

node Tweet_node {}

node Tweet {
    has content: str;
    has tag: str;
    has embedding:np.ndarray;
}

node Comment {
    has content: str;
    has embedding:np.ndarray;
}

edge Following {}

edge Tweeting {}

edge Reply {}

edge Like {}
glob hastag_node:Hastag_node = Hastag_node();
glob tweet_main: Tweet_main = Tweet_main();
glob tweet_node:Tweet_node;

walker Start {
    can start with `root entry {
        :g: tweet_node, tweet_main ;

        Jac.unrestrict(here, 1);
        feed_node = Feed_node();
        tweet_node = Tweet_node();
        root ++> [feed_node, tweet_node];
        tweet_main ++> tweet_node;
        report feed_node;
        report tweet_node;
    }
}

walker follow_request {
    has followee_tnode_jid: str;

    can follow with `root entry {
        root +:Following():+> (&(self.followee_tnode_jid));
        report [root-->];
    }
}

walker tweet {
    has content: str;
    has tag: str;

    can tweet with `root entry {
        :g: tweet_node, hastag_node ;
        model = SentenceTransformer('sentence-transformers/multi-qa-mpnet-base-cos-v1');
        embedding = model.encode(self.content);

        tweet_node +:Tweeting():+> (user_tweet := Tweet(self.content, self.tag));
        Feed_node.Update_prob(user_tweet.tag);
        tags = [i.tag for i in [hastag_node-->]];
        if self.tag not in tags {
            hastag_node ++> Hastag(self.tag);
        }
        Jac.unrestrict(user_tweet, 1);
        report user_tweet;
        report [hastag_node-->];
    }
}

walker comment {
    has tweet_jid: str;
    has content: str;

    can comment with `root entry {
        model = SentenceTransformer('sentence-transformers/multi-qa-mpnet-base-cos-v1');
        embedding = model.encode(self.content);
        (tweet:=&(self.tweet_jid)) +:Reply():+> (user_comment := Comment(self.content,embedding));
        Feed_node.Update_prob(tweet.tag);
        report user_comment;
    }
}

walker like{
    has tweet_jid: str;

    can like with `root entry{
       root +:Like():+> (tweet:= &(self.tweet_jid)) ;
       Feed_node.Update_prob(tweet.tag);
    }
}

walker load_feed {
    can feed with `root entry {
        feed_list = [];
        followee_list = [root-:Following:->];
        
        for followee in followee_list {
            for tweet in [followee-->] {
                feed_list.append(tweet);
            }
        }
        feed_list = feed_list[:3];
        tag_feed_list = [get_high_hastag()-->];
        tag_feed_list = tag_feed_list[:3]
        feed_list = feed_list + tag_feed_list;
        report [&i for i in feed_list];
    }
}

walker search {
    has query: str;

    can Search with entry {
        search_tag: any = None;
        :g: hastag_node, tweet_main;
        
        for hastag in [hastag_node-->] {
            if hastag.tag == self.query {
                search_tag = hastag;
            }
        }
        search_result = [search_tag-->] if search_tag else [];
        if (not search_tag) {
            for tweet_node in [tweet_main-->] {
                search_result.append(self.deep_search([tweet_node-->]));
                search_result = sorted(
                    search_result,
                    key=(with x: int can x[1]), reverse=True
                );
                search_result = search_result[:5];
            }
        }
        report search_result if search_result else None;
    }

    can deep_search(tweet_list: list) -> list {
        model = SentenceTransformer('sentence-transformers/multi-qa-mpnet-base-cos-v1');
        docs = [i.content for i in tweet_list];
        query_emb = model.encode(self.query);
        doc_emb = model.encode(docs);
        scores = util.dot_score(query_emb, doc_emb)[0].cpu().tolist();
        doc_score_pairs = list(zip(tweet_list, scores));
        doc_score_pairs = sorted(
            doc_score_pairs,
            key=(with x: int can x[1]), reverse=True
        );
        return doc_score_pairs;
    }
}
