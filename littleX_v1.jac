node Hastag_node {}

node Hastag {
    has tag: str;
}

node Feed_node {}

node Tweet_node {}

node Tweet {
    has content: str;
    has tag: str;
    # has emmbedding:np.array;
}

node Comment {
    has content: str;
    # has emmbedding:np.array;
}

edge Following {}

edge Tweeting {}

edge Reply {}

glob hastag_node:Hastag_node = Hastag_node();
glob tweet_node:Tweet_node;

walker Start {
    can start with `root entry {
        :g: tweet_node ;

        Jac.unrestrict(here, 1);
        feed_node = Feed_node();
        tweet_node = Tweet_node();
        root ++> [feed_node, tweet_node];
        report feed_node;
        report tweet_node;
        report [root-->];
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
        :g: tweet_node ;

        tweet_node +:Tweeting():+> (user_tweet := Tweet(self.content, self.tag));
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
        &(self.tweet_jid) +:Reply():+> (user_comment := Comment(self.content));
        report user_comment;
    }
}

walker load_feed {
    can feed with `root entry {
        feed_list = [];
        followee_list = [root-:Following:->];
        
        for followee in followee_list {
            for tweet in [followee-->] {
                feed_list.append(jid(tweet));
            }
        }
        report [&i for i in feed_list];
    }
}

walker search {
    has query: str;

    can Search with entry {
        search_tag: any = None;
        :g: hastag_node ;

        hastag_list = [i for i in [hastag_node-->]];
        
        for hastag in hastag_list {
            if hastag.tag == self.query {
                search_tag = hastag;
            }
        }
        report [search_tag-->] if search_tag else None;
    }
}
