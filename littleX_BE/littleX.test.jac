
test update_profile {
    root spawn visit_profile();
    profile = [root --> (`?Profile)][0];
    test1 = profile spawn update_profile(
        new_username = "test_user",
    ); 
    assert test1.new_username == "test_user";
}

test get_profile {
    root spawn visit_profile();
    profile = [root --> (`?Profile)][0];
    profile.username = "Tom";

    follower = Profile("Sam");
    follower spawn follow_request();

    follower_profile = [profile-:Follow:->(`?Profile)][0];
    assert follower_profile.username == "Sam";
}

# test load_user_profiles {
#     test_item1 = root spawn visit_profile();
#     tom = root spawn update_profile(
#         new_username = "test1_user",
#     );
#     test1 = root spawn load_user_profiles(
#     ); 
#     print("profiles",test1.profiles);
#     created_item1 = test1.profiles[0];
#     print("profiles",created_item1);
#     first_jid = jid(created_item1);
#     assert created_item1.name == "test1_user";
#     assert created_item1.id == first_jid;

#     # test_item2 = root spawn visit_profile(
#     # );
#     # root spawn update_profile(
#     #     new_username = "test2_user",
#     # );
#     # test2 = root spawn load_user_profiles(
#     # ); 
#     # created_item2 = test2.profiles[0];
#     # second_jid = jid(created_item2);
#     # assert created_item2.name == "test2_user";
#     # assert created_item2.id == second_jid;
# }

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

    followee_profile = [profile-:Follow:->(`?Profile)][0];
    followee spawn un_follow_request();
    followee_profile = [profile-:Follow:->(`?Profile)];

    assert len(followee_profile) == 2;
}

test create_tweet {
    root spawn visit_profile();
    profile = [root --> (`?Profile)][0];
    profile spawn create_tweet(
        content = "test_tweet",
    ); 
    test1 = [profile --> (`?Tweet)][0];
    assert test1.content == "test_tweet";
}

test update_tweet {
    root spawn visit_profile();
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
    root spawn visit_profile();
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
    root spawn visit_profile(
    );
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
    root spawn visit_profile(
    );
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

# test load_feed {
#     root spawn visit_profile();
#     profile = [root --> (`?Profile)][0];
#     profile spawn create_tweet(
#         content = "test_tweet",
#     );
#     tweet = [profile --> (`?Tweet)][0];
#     # tweet spawn load_feed(
#     #     results = "[311321]",
#     # );
#     print("test1",tweet);
#     # assert test1.search_query == "test_tweet";
#     # assert len(test1.results) > 0;
# }