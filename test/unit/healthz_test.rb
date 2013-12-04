require 'test_helper'

class HealthzTest < ActiveSupport::TestCase

  class HealthzTester
    def call(env)
      [200, { 'Content-Type' => 'text/html' }, ['test']]
    end
  end

  setup :create_tester_app

  test 'intercepts healthz requests' do
    assert_equal [200, { 'Content-Type' => 'text/html' }, ['ok']], @healthz.call({ 'PATH_INFO' => '/healthz' })
  end

  test 'allows other requests through' do
    assert_equal [200, { 'Content-Type' => 'text/html' }, ['test']], @healthz.call({ 'PATH_INFO' => '/' })
  end

  private

  def create_tester_app
    tester = HealthzTester.new
    @healthz = Healthz.new(tester)
  end

end
