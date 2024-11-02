node Hastag_node {}

node Hastag {
    has tag: str;
}

node Feed_node {}

node Tweet_node {}

node Tweet {
    has content: str;
    has tag: str;
}

node Comment {
    has content: str;
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
        Jac.unrestrict(tweet_node, 1);
        report feed_node;
        report tweet_node;
    }
}

walker follow_request {
    has followee_tnode_jid: str;

    can follow with `root entry {
        root +:Following():+> (&(self.followee_tnode_jid));
    }
}

walker tweet {
    has content: str;
    has tag: str;

    can tweet with `root entry {
        :g: tweet_node ;

        tweet_node +:Tweeting():+> (user_tweet := Tweet(self.content, self.tag));
        if (i := [hastag_node-->](?tag == self.tag)) {
            i[0] ++> user_tweet;
        } else {
            hastag_node ++> (hastag := Hastag(self.tag));
            hastag ++> user_tweet;
        }
        Jac.unrestrict(user_tweet, 1);
        report user_tweet;
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
        for tweet in [root-:Following:->-:Tweeting:->] {
            report tweet;
        }
    }
}

walker search {
    has query: str;

    can Search with entry {
        :g: hastag_node ;

        if (i := [hastag_node-->](?tag == self.query)) {
            report [i[0]-->];
        }
    }
}
