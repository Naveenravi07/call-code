use lapin::types::Boolean;
use std::io;
use tokio::fs;
use tokio::process::Command;

pub async fn check_dir_exists(path: &str) -> Boolean {
    let status = match fs::try_exists(path).await {
        Ok(val) => val,
        Err(_e) => false,
    };
    return status;
}

pub async fn create_dir(path: &str) -> io::Result<()> {
    fs::create_dir(path).await?;
    Ok(())
}

pub async fn clone_repository(repo_url: &str, repo_path: &str) -> io::Result<()> {
    Command::new("git")
        .arg("clone")
        .arg(repo_url)
        .arg(repo_path)
        .status()
        .await?;
    Ok(())
}

pub async fn create_docker_volume(vol_name: &str) -> io::Result<()> {
    Command::new("sudo")
        .arg("docker ")
        .arg("volume")
        .arg("create")
        .arg(vol_name)
        .status()
        .await?;
    Ok(())
}
