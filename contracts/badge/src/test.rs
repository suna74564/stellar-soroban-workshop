#![cfg(test)]

use crate::{BadgeContract, BadgeContractClient};
use soroban_sdk::testutils::{Address as _, Events as _};
use soroban_sdk::{vec, Address, Env, IntoVal, Symbol};

#[test]
fn records_badge_score_and_event() {
    let env = Env::default();
    let contract_id = env.register(BadgeContract, ());
    let client = BadgeContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    assert_eq!(client.score(&user), 0);
    assert_eq!(client.total_badges(), 0);

    assert_eq!(client.record(&user, &3, &12), 32);
    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                contract_id.clone(),
                (Symbol::new(&env, "badge_updated"), user.clone()).into_val(&env),
                vec![&env, 32u32, 1u32].into_val(&env),
            ),
        ],
    );

    assert_eq!(client.score(&user), 32);
    assert_eq!(client.total_badges(), 1);
}

#[test]
fn does_not_double_count_existing_badge_holder() {
    let env = Env::default();
    let contract_id = env.register(BadgeContract, ());
    let client = BadgeContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    assert_eq!(client.record(&user, &1, &1), 10);
    assert_eq!(client.record(&user, &8, &8), 81);
    assert_eq!(client.total_badges(), 1);
}

#[test]
fn caps_score_at_one_hundred() {
    let env = Env::default();
    let contract_id = env.register(BadgeContract, ());
    let client = BadgeContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    let other_user = Address::generate(&env);

    assert_eq!(client.record(&user, &15, &50), 100);
    assert_eq!(client.record(&other_user, &2, &50), 30);
    assert_eq!(client.total_badges(), 2);
}
