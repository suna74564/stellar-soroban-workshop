#![cfg(test)]

use crate::{CheckinContract, CheckinContractClient};
use soroban_sdk::testutils::{Address as _, Events as _};
use soroban_sdk::{symbol_short, vec, Address, Env, IntoVal};

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
                vec![&env, 1u32, 1u32].into_val(&env),
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
                vec![&env, 2u32, 2u32].into_val(&env),
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
                vec![&env, 1u32, 3u32].into_val(&env),
            ),
        ],
    );

    assert_eq!(client.get_count(&user), 2);
    assert_eq!(client.get_count(&other_user), 1);
    assert_eq!(client.total(), 3);
}
