
test visit_profile {
    root spawn visit_profile();
    profile = [root --> (`?Profile)][0];
    assert isinstance(profile, Profile); 
}

test update_profile {
    profile = [root --> (`?Profile)][0];
    profile spawn update_profile(
        new_username = "test_user",
    ); 
    assert profile.username == "test_user";
}

test follow_request {
    profile = [root --> (`?Profile)][0];

    followee = Profile("Sam");
    followee spawn follow_request();

    followee_profile = [profile-:Follow:->(`?Profile)][0];
    assert followee_profile.username == "Sam";
}

test un_follow_request {
    profile = [root --> (`?Profile)][0];
    followee = Profile("Jonny");
    followee spawn follow_request();
    followee spawn un_follow_request();
    followee_profile = [profile-:Follow:->(`?Profile)];
    assert len(followee_profile) == 1;
}

test create_tweet {
    profile = [root --> (`?Profile)][0];
    profile spawn create_tweet(
        content = "test_tweet",
    ); 
    test1 = [profile --> (`?Tweet)][0];
    assert test1.content == "test_tweet";
}

test update_tweet {
    profile = [root --> (`?Profile)][0];
    profile spawn create_tweet(
        content = "test_tweet",
    );
    tweet1 = [profile --> (`?Tweet)][0];
    tweet1 spawn update_tweet(
        updated_content = "new_tweet",
    );
    assert tweet1.content == "new_tweet";
}

test remove_tweet {
    profile = [root --> (`?Profile)][0];
    tweet2 = [profile --> (`?Tweet)][0];
    tweet2 spawn remove_tweet();
    tweet2 = [profile --> (`?Tweet)];
    assert len(tweet2) == 1;
}

test like_tweet {
    profile = [root --> (`?Profile)][0];
    profile.username = "Tom";
    profile spawn create_tweet(
        content = "test_tweet",
    );
    tweet1 = [profile --> (`?Tweet)][0];
    tweet1 spawn like_tweet();
    test1 = [tweet1 -:Like:-> ][0];
    assert test1.username == "Tom";
}

test remove_like {
    profile = [root --> (`?Profile)][0];
    tweet1 = [profile --> (`?Tweet)][0];
    tweet1 spawn remove_like();
    test1 = [tweet1 -:Like:-> ];
    assert len(test1) == 0;
}

test comment_tweet {
    profile = [root --> (`?Profile)][0];
    profile spawn create_tweet(
        content = "test_tweet",
    );
    tweet = [profile --> (`?Tweet)][0];
    test1 = tweet spawn comment_tweet(
        content = "test_comment",
    );
    assert test1.content == "test_comment";
}

test update_comment{
    profile = [root --> (`?Profile)][0];
    profile spawn create_tweet(
        content = "test_tweet",
    );
    tweet = [profile --> (`?Tweet)][0];
    tweet spawn comment_tweet(
        content = "test_comment",
    );
    comment = [tweet --> (`?Comment)][0];
    comment spawn update_comment(
        updated_content = "new_comment",
    );
    assert comment.content == "new_comment";
}

test remove_comment {
    profile = [root --> (`?Profile)][0];
    tweet = [profile --> (`?Tweet)][0];
    comment = [tweet --> (`?Comment)][0];
    comment spawn remove_comment(
    );
    comment = [tweet --> (`?Comment)];
    
    assert len(comment) == 1;
}