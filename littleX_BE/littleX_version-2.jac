import:py logging;
import:py datetime;
import:py from jac_cloud.core.architype { NodeAnchor }

glob logger = logging.getLogger("littelX");

node profile {
    has username: str = "";
    has count_tag: dict = {};
    has followees: list = [];
}

node tweet {
    has content: str;
    has created_at: str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S");
}

node comment {
    has content: str;
}

edge follow {}

edge like {}

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

walker load_likes {
    has likes: list = [];

    can load_likes with tweet entry {
        visit [<-:like:-];
    }

    can load_profile with profile entry {
        self.likes.append({"username": here.username});
    }

}

walker load_tweet {
    has tweet_info: dict = {};

    can load_likes with tweet entry {
        self.tweet_info["content"] = here;
        visit [<--(`?profile)];
    }

    can load_profile with profile entry {
        self.tweet_info["username"] = here.username;
    }

}

walker load_comments {
    has comments: list = [];

    can load_comments with tweet entry {
        visit [-->](`?comment);
    }

    can report_comments with comment entry {
        Jac.unrestrict(here, level="READ");
        self.comments.append(here);
    }
}

walker load_tweets :visit_profile: {
    has tweet_info: dict = {};

    can go_to_tweet with profile entry {
        visit [-->](`?tweet);
    }

    can load_tweets with tweet entry {
        Jac.unrestrict(here, level="READ");
        comments = here spawn load_comments();
        likes = here spawn load_likes();
        tweet_content = here spawn load_tweet();
        self.tweet_info = {
            "comments": comments.comments,
            "likes": likes.likes,
            "tweet": tweet_content.tweet_info
        };
        report self.tweet_info;
    }
}

walker load_feed :visit_profile: {
    can load with profile entry {
        here spawn load_tweets();
        for user in here.followees {
            user_node = &user;
            Jac.unrestrict(user_node, level="READ");
            logger.info("Acess has given");
            user_node spawn load_tweets();
            logger.info("Removing acess");
        }
    }
}

walker create_tweet :visit_profile: {
    has content: str;

    can tweet with profile entry {
        tweet_node = here ++> tweet(content=self.content);
        visit tweet_node;
    }

    can report_tweet with tweet entry {
        logger.info(f"Creating new tweet: {here.content}");
        Jac.unrestrict(here, level="READ");
        report here;
    }
}

walker like_tweet :visit_profile: {
    has tweet_id: str;

    can like with profile entry {
        tweet_node = &self.tweet_id;
        here +:like():+> (tweet := tweet_node);
        logger.info(f"liked to a tweet: {tweet_node}");
        report tweet_node;
    }
}

walker comment_tweet :visit_profile: {
    has tweet_id: str;
    has content: str;

    can add_comment with profile entry {
        comment_node = here ++> comment(content=self.content);
        tweet_node = &self.tweet_id;
        Jac.unrestrict(tweet_node, level="CONNECT");
        tweet_node ++> comment_node[0];
        logger.info(f"comment added: {comment_node[0]}");
        report comment_node[0];
    }
}
