import:py logging;
import:py datetime;
import:py from jac_cloud.core.architype { NodeAnchor }
import:py from mtllm.llms { OpenAI }
import:py from sentence_transformers { SentenceTransformer }
import:py from sklearn.metrics.pairwise { cosine_similarity }
import:py numpy;

glob logger = logging.getLogger("littelX");
glob llm = OpenAI(model_name="gpt-4o");

node profile {
    has username: str = "";
    has followees: list = [];
}

node tweet {
    has content: str;
    has created_at: str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S");
}

edge follow {}

edge post {}

can 'Summarize what users are talking abouth in their latest trends, major events, and notable interactions from the recent tweets in one line.'
summarise_tweets(tweets: list[str]) -> 'Summarisation': str by llm();

walker visit_profile {
    can visit_profile with `root entry {
        visit [-->(`?profile)] else {
            logger.info("Creating new profile");
            new_profile = here ++> profile();
            visit new_profile;
        }
    }
}

walker load_user_profiles {
    obj __specs__ {
        static has auth: bool = False;
    }
    can load_profiles with `root entry {
        self.profiles: list = [];
        
        for user in NodeAnchor.Collection.find({"name": "profile"}) {
            user_node = user.architype;
            self.profiles.append(
                {"name": user_node.username, "id": jid(user_node)}
            );
        }
        report self.profiles;
    }
}

walker update_profile :visit_profile: {
    has new_username: str;

    can update_profile with profile entry {
        logger.info("Updating profile");
        here.username = self.new_username;
        report here;
    }
}

walker get_profile :visit_profile: {
    can get_profile with profile entry {
        logger.info(f"prfile info: {here}");
        report here;
    }
}

walker follow_request :visit_profile: {
    has profile_id: str;

    can follow with profile entry {
        here.followees.append(self.profile_id);
        logger.info(f"New followee addded: {self.profile_id}");
        here +:follow():+> &self.profile_id;
        report here;
    }
}

walker un_follow_request :visit_profile: {
    has profile_id: str;

    can un_follow with profile entry {
        here.followees.remove(self.profile_id);
        logger.info(f"Followe removed: {self.profile_id}");
        here del-:follow:-> &self.profile_id;
        report here;
    }
}

walker load_tweet {
    has tweet_info: dict = {};

    can load_tweets with tweet entry {
        self.tweet_info["content"] = here;
        visit [<-:post:-];
    }

    can load_profile with profile entry {
        self.tweet_info["username"] = here.username;
    }

}

walker load_tweets :visit_profile: {
    has if_report: bool = False;
    has tweets: list = [];

    can go_to_tweet with profile entry {
        visit [-->](`?tweet);
    }

    can load_tweets with tweet entry {
        Jac.unrestrict(here, level="READ");
        tweet_content = here spawn load_tweet();

        tweet_info = {"tweet": tweet_content.tweet_info};
        self.tweets.append(tweet_info);
        if self.if_report {
            report self.tweets;
        }
    }
}

walker load_feed :visit_profile: {
    can load with profile entry {
        self.feeds: list = [];
        user_tweets = here spawn load_tweets();
        self.feeds.extend(user_tweets.tweets);
        
        for user in here.followees {
            user_node = &user;
            Jac.unrestrict(user_node, level="READ");
            logger.info("Acess has given to profile node");
            user_tweets = user_node spawn load_tweets();
            self.feeds.extend(user_tweets.tweets);
        }
        tweets = [feed['tweet']['content'].content for feed in self.feeds];
        self.summary: str = summarise_tweets(tweets);

        report {"feeds": self.feeds, "summary": self.summary};

    }
}

walker create_tweet :visit_profile: {
    has content: str;

    can tweet with profile entry {
        tweet_node = here +:post:+> tweet(content=self.content);
        visit tweet_node;
    }

    can report_tweet with tweet entry {
        logger.info(f"Creating new tweet: {here.content}");
        Jac.unrestrict(here, level="READ");
        report here;
    }
}

walker update_tweet :visit_profile: {
    has tweet_id: str;
    has updated_content: str;

    can visit_tweet with profile entry {
        tweet_node = &self.tweet_id;
        visit tweet_node;
        logger.info(f"Tweet deleted: {tweet_node}");
    }
    # can be enhanced to directly use the jid instead
    can update_tweet with tweet entry {
        here.content = self.updated_content;
        report here;
    }
}

walker remove_tweet :visit_profile: {
    has tweet_id: str;

    can remove_tweet with profile entry {
        tweet_node = &self.tweet_id;
        del tweet_node;
        logger.info(f"Tweet deleted: {tweet_node}");
        report True;
    }
}
