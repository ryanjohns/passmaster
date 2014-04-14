class HealthChecksController < ActionController::Base

  def show
    ActiveRecord::Migrator.current_version
    render :plain => 'ok', :status => :ok
  rescue
    render :plain => 'error', :status => :error
  end

end
