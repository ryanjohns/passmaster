class HealthzController < ApplicationController

  def index
    render :text => 'ok'
  end

end
