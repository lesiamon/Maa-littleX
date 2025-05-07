
test visit_profile {
    root spawn visit_profile();
    profile = [root --> (`?Profile)][0];
    check isinstance(profile,Profile); 
}

test update_profile {
    root spawn update_profile(
        new_username = "test_user",
    ); 
    profile = [root --> (`?Profile)][0];
    check profile.username == "test_user";
}

test follow_request {
    followee = Profile("Sam");
    followee spawn follow_request();
    followee_profile = [root --> (`?Profile)-:Follow:->(`?Profile)][0];
    assert followee_profile.username == "Sam";
}

test un_follow_request {
    followee = Profile("Jonny");
    followee spawn follow_request();
    followee spawn un_follow_request();
    followee_profile = [root --> (`?Profile)-:Follow:->(`?Profile)];
    check len(followee_profile) == 1;
}

test create_tweet {
    root spawn create_tweet(
        content = "test_tweet",
    ); 
    test1 = [root --> (`?Profile) --> (`?Tweet)][0];
    check test1.content == "test_tweet";
}

test update_tweet {
    root spawn create_tweet(
        content = "test_tweet",
    );
    tweet1 = [root --> (`?Profile) --> (`?Tweet)][0];
    tweet1 spawn update_tweet(
        updated_content = "new_tweet",
    );
    check tweet1.content == "new_tweet";
}

test remove_tweet {
    tweet2 =  [root --> (`?Profile)--> (`?Tweet)][0];
    tweet2 spawn remove_tweet();
    tweet2 = [root --> (`?Profile) --> (`?Tweet)];
    check len(tweet2) == 1;
}

test like_tweet {
    tweet1 = [root --> (`?Profile) --> (`?Tweet)][0];
    tweet1 spawn like_tweet();
    test1 = [tweet1 -:Like:-> ][0];
    check test1.username == "test_user";
}

test remove_like {
    tweet1 = [root --> (`?Profile) --> (`?Tweet)][0];
    tweet1 spawn remove_like();
    test1 = [tweet1 -:Like:-> ];
    check len(test1) == 0;
}

test comment_tweet {
    root spawn create_tweet(
        content = "test_tweet",
    );
    tweet = [root --> (`?Profile) --> (`?Tweet)][0];
    test1 = tweet spawn comment_tweet(
        content = "test_comment",
    );
    check test1.content == "test_comment";
}

test update_comment{
    tweet = [root --> (`?Profile) --> (`?Tweet)][0];
    comment = [tweet --> (`?Comment)][0];
    comment spawn update_comment(
        updated_content = "new_comment",
    );
    check comment.content == "new_comment";
}

test remove_comment {
    comment = [root --> (`?Profile) --> (`?Tweet) --> (`?Comment)][0];
    comment spawn remove_comment();
    comment = [root --> (`?Profile) --> (`?Tweet) --> (`?Comment)];  
    check len(comment) == 0;
}