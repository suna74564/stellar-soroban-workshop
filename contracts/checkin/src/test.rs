#![cfg(test)]

use crate::{CheckinContract, CheckinContractClient};
use badge::{BadgeContract, BadgeContractClient};
use soroban_sdk::testutils::{Address as _, Events as _};
use soroban_sdk::{symbol_short, vec, Address, Env, IntoVal, Symbol};

#[test]
fn test_check_in() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CheckinContract, ());
    let client = CheckinContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    let other_user = Address::generate(&env);

    assert_eq!(client.get_count(&user), 0);
    assert_eq!(client.total(), 0);

    assert_eq!(client.check_in(&user), 1);
    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                contract_id.clone(),
                (symbol_short!("check_in"), user.clone()).into_val(&env),
                vec![&env, 1u32, 1u32, 0u32].into_val(&env),
            ),
        ],
    );

    assert_eq!(client.check_in(&user), 2);
    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                contract_id.clone(),
                (symbol_short!("check_in"), user.clone()).into_val(&env),
                vec![&env, 2u32, 2u32, 0u32].into_val(&env),
            ),
        ],
    );

    assert_eq!(client.check_in(&other_user), 1);
    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                contract_id.clone(),
                (symbol_short!("check_in"), other_user.clone()).into_val(&env),
                vec![&env, 1u32, 3u32, 0u32].into_val(&env),
            ),
        ],
    );

    assert_eq!(client.get_count(&user), 2);
    assert_eq!(client.get_count(&other_user), 1);
    assert_eq!(client.total(), 3);
}

#[test]
fn configures_badge_contract() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CheckinContract, ());
    let badge_id = env.register(BadgeContract, ());
    let client = CheckinContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    assert_eq!(client.badge_contract(), None);
    assert_eq!(client.configure_badge(&admin, &badge_id), badge_id);

    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                contract_id,
                (Symbol::new(&env, "badge_linked"), admin.clone()).into_val(&env),
                vec![&env, badge_id.clone()].into_val(&env),
            ),
        ],
    );

    assert_eq!(client.badge_contract(), Some(badge_id.clone()));
}

#[test]
fn check_in_updates_badge_contract() {
    let env = Env::default();
    env.mock_all_auths();

    let checkin_id = env.register(CheckinContract, ());
    let badge_id = env.register(BadgeContract, ());
    let checkin_client = CheckinContractClient::new(&env, &checkin_id);
    let badge_client = BadgeContractClient::new(&env, &badge_id);
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    checkin_client.configure_badge(&admin, &badge_id);

    assert_eq!(checkin_client.check_in(&user), 1);
    assert_eq!(badge_client.score(&user), 10);
    assert_eq!(badge_client.total_badges(), 1);

    assert_eq!(checkin_client.check_in(&user), 2);
    assert_eq!(badge_client.score(&user), 20);
    assert_eq!(badge_client.total_badges(), 1);
}
